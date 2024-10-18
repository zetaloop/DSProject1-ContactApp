import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ContactType } from "@/types";

interface ContactTableProps {
  contacts: ContactType[];
  onEdit: (contact: ContactType) => void;
  onDelete: (id: string) => void;
  onRowClick: (contact: ContactType) => void;
}

const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onEdit,
  onDelete,
  onRowClick,
}) => {
  return (
    <Table className="mt-4">
      <TableHeader>
        {" "}
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
          <TableRow
            key={contact.id}
            onClick={() => onRowClick(contact)}
            className="cursor-pointer hover:bg-muted"
          >
            <TableCell>
              <Avatar>
                <AvatarImage
                  src={contact.picture}
                  alt={`${contact.name}的头像`}
                />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>{contact.name}</TableCell>
            <TableCell>{contact.email}</TableCell>
            <TableCell className={contact.phone ? "" : "text-muted-foreground"}>
              {contact.phone || "未提供"}
            </TableCell>
            <TableCell
              className={contact.birthDate ? "" : "text-muted-foreground"}
            >
              {contact.birthDate
                ? format(new Date(contact.birthDate), "yyyy-MM-dd", {
                    locale: zhCN,
                  })
                : "未提供"}
            </TableCell>
            <TableCell
              className={`max-w-xs truncate ${
                contact.intro ? "" : "text-muted-foreground"
              }`}
            >
              {contact.intro || "未提供"}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                className="mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(contact);
                }}
              >
                编辑
              </Button>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(contact.id);
                }}
              >
                删除
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ContactTable;
