'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  picture?: string
  birthDate?: string
  intro?: string
}

// 模拟的 API 函数
const fetchContacts = (): Promise<Contact[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: '张三', email: 'zhangsan@example.com', phone: '123-456-7890', birthDate: '1990-01-01', intro: '软件工程师' },
        { id: 2, name: '李四', email: 'lisi@example.com', birthDate: '1985-05-15', intro: '产品经理' },
      ])
    }, 500)
  })
}

const addContact = (contact: Omit<Contact, 'id'>): Promise<Contact> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...contact, id: Date.now() })
    }, 500)
  })
}

const updateContact = (contact: Contact): Promise<Contact> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(contact)
    }, 500)
  })
}

const deleteContact = (id: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}

const uploadImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setTimeout(() => {
        resolve(reader.result as string)
      }, 500)
    }
    reader.readAsDataURL(file)
  })
}

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentContact, setCurrentContact] = useState<Contact | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [detailedContact, setDetailedContact] = useState<Contact | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const { toast } = useToast()

  // 新增的状态变量，用于日期选择器
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentContact?.birthDate ? new Date(currentContact.birthDate) : undefined
  )

  useEffect(() => {
    fetchContacts().then((data) => {
      setContacts(data)
      setIsLoading(false)
    })
  }, [])

  // 当 currentContact 变化时，更新 selectedDate
  useEffect(() => {
    setSelectedDate(currentContact?.birthDate ? new Date(currentContact.birthDate) : undefined)
  }, [currentContact])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const contactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      // 使用 selectedDate 代替表单中的 birthDate
      birthDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd', { locale: zhCN }) : undefined,
      intro: formData.get('intro') as string || undefined,
    }

    let pictureUrl = currentContact?.picture

    if (selectedFile) {
      pictureUrl = await uploadImage(selectedFile)
    }

    if (currentContact) {
      const updatedContact = await updateContact({ ...contactData, id: currentContact.id, picture: pictureUrl })
      setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c))
      toast({ title: "联系人更新成功" })
    } else {
      const newContact = await addContact({ ...contactData, picture: pictureUrl })
      setContacts([...contacts, newContact])
      toast({ title: "联系人添加成功" })
    }

    setIsDialogOpen(false)
    setCurrentContact(null)
    setSelectedFile(null)
    setSelectedDate(undefined) // 重置日期选择器
  }

  const handleEdit = (contact: Contact) => {
    setCurrentContact(contact)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    await deleteContact(id)
    setContacts(contacts.filter(c => c.id !== id))
    setDetailedContact(null)
    toast({ title: "联系人已删除" })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleRowClick = (contact: Contact) => {
    setDetailedContact(contact)
    setIsDetailDialogOpen(true)
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">联系人列表</h1>
      <div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setCurrentContact(null)}>添加联系人</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentContact ? '编辑联系人' : '添加联系人'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedFile ? URL.createObjectURL(selectedFile) : currentContact?.picture} />
                  <AvatarFallback>{currentContact?.name?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="picture" className="cursor-pointer">
                    <Input
                      id="picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button asChild variant="outline">
                      <span>{currentContact?.picture || selectedFile ? '更换图片' : '上传图片'}</span>
                    </Button>
                  </Label>
                </div>
              </div>
              <div>
                <Label>姓名</Label>
                <Input
                  name="name"
                  placeholder="姓名"
                  defaultValue={currentContact?.name || ''}
                  required
                />
              </div>
              <div>
                <Label>邮箱</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="邮箱"
                  defaultValue={currentContact?.email || ''}
                  required
                />
              </div>
              <div>
                <Label>电话</Label>
                <Input
                  name="phone"
                  placeholder="电话"
                  defaultValue={currentContact?.phone || ''}
                />
              </div>
              <div>
                <Label>生日</Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        {selectedDate ? format(selectedDate, 'yyyy-MM-dd', { locale: zhCN }) : '选择日期'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        locale={zhCN}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* 清除日期按钮 */}
                  <Button variant="outline" type="button" onClick={() => setSelectedDate(undefined)}>
                    清除
                  </Button>
                </div>
              </div>
              <div>
                <Label>介绍</Label>
                <Textarea
                  name="intro"
                  placeholder="介绍"
                  defaultValue={currentContact?.intro || ''}
                />
              </div>
              <Button variant="outline" type="submit">保存</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>头像</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>生日</TableHead>
              <TableHead>介绍</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id} onClick={() => handleRowClick(contact)} className="cursor-pointer hover:bg-muted">
                <TableCell>
                  <Avatar>
                    <AvatarImage src={contact.picture} alt={`${contact.name}的头像`} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell className={contact.phone ? "" : "text-muted-foreground"}>{contact.phone || '未提供'}</TableCell>
                <TableCell className={contact.birthDate ? "" : "text-muted-foreground"}>
                  {contact.birthDate ? format(new Date(contact.birthDate), 'yyyy-MM-dd', { locale: zhCN }) : '未提供'}
                </TableCell>
                <TableCell className={`max-w-xs truncate ${contact.intro ? "" : "text-muted-foreground"}`}>
                  {contact.intro || '未提供'}
                </TableCell>
                <TableCell>
                  <Button variant="outline" className="mr-2" onClick={(e) => { e.stopPropagation(); handleEdit(contact); }}>
                    编辑
                  </Button>
                  <Button variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 联系人详情弹出窗口 */}
        {detailedContact && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>联系人详情</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={detailedContact.picture} alt={`${detailedContact.name}的头像`} />
                  <AvatarFallback>{detailedContact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{detailedContact.name}</h2>
                  <p className="text-muted-foreground">{detailedContact.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                {detailedContact.phone && (
                  <p><strong>电话：</strong>{detailedContact.phone}</p>
                )}
                {detailedContact.birthDate && (
                  <p><strong>生日：</strong>{format(new Date(detailedContact.birthDate), 'yyyy年M月d日', { locale: zhCN })}</p>
                )}
                {!detailedContact.phone && !detailedContact.birthDate && (
                  <p className="text-muted-foreground">无信息</p>
                )}
                {detailedContact.intro && (
                  <Card>
                    <CardHeader>
                      <p className="whitespace-pre-wrap leading-relaxed">{detailedContact.intro}</p>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}