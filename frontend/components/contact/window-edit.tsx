import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ContactType } from "@/types";

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentContact: ContactType | null;
  onSave: (
    contactData: Omit<ContactType, "id">,
    selectedFile: File | null
  ) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  isOpen,
  onClose,
  currentContact,
  onSave,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentContact?.birthDate ? new Date(currentContact.birthDate) : undefined
  );

  useEffect(() => {
    setSelectedDate(
      currentContact?.birthDate ? new Date(currentContact.birthDate) : undefined
    );
  }, [currentContact]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const contactData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      birthDate: selectedDate
        ? format(selectedDate, "yyyy-MM-dd", { locale: zhCN })
        : undefined,
      intro: (formData.get("intro") as string) || undefined,
      picture: currentContact?.picture,
      id: currentContact?.id,
    };

    await onSave(contactData, selectedFile);

    onClose();
    setSelectedFile(null);
    setSelectedDate(undefined);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentContact ? "编辑联系人" : "添加联系人"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : currentContact?.picture
                }
              />
              <AvatarFallback>
                {currentContact?.name?.charAt(0) || "A"}
              </AvatarFallback>
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
                  <span>
                    {currentContact?.picture || selectedFile
                      ? "更换图片"
                      : "上传图片"}
                  </span>
                </Button>
              </Label>
            </div>
          </div>
          <div>
            <Label>姓名</Label>
            <Input
              name="name"
              placeholder="姓名"
              defaultValue={currentContact?.name || ""}
              required
            />
          </div>
          <div>
            <Label>邮箱</Label>
            <Input
              name="email"
              type="email"
              placeholder="邮箱"
              defaultValue={currentContact?.email || ""}
              required
            />
          </div>
          <div>
            <Label>电话</Label>
            <Input
              name="phone"
              placeholder="电话"
              defaultValue={currentContact?.phone || ""}
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
                    {selectedDate
                      ? format(selectedDate, "yyyy-MM-dd", { locale: zhCN })
                      : "选择日期"}
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
              <Button
                variant="outline"
                type="button"
                onClick={() => setSelectedDate(undefined)}
              >
                清除
              </Button>
            </div>
          </div>
          <div>
            <Label>介绍</Label>
            <Textarea
              name="intro"
              placeholder="介绍"
              defaultValue={currentContact?.intro || ""}
            />
          </div>
          <Button variant="outline" type="submit">
            保存
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;