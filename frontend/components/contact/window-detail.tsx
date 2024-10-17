import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ContactType } from "@/types";

interface ContactDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactType;
}

const ContactDetailDialog: React.FC<ContactDetailDialogProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>联系人详情</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={contact.picture} alt={`${contact.name}的头像`} />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{contact.name}</h2>
            <p className="text-muted-foreground">{contact.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          {contact.phone && (
            <p>
              <strong>电话：</strong>
              {contact.phone}
            </p>
          )}
          {contact.birthDate && (
            <p>
              <strong>生日：</strong>
              {format(new Date(contact.birthDate), "yyyy年M月d日", {
                locale: zhCN,
              })}
            </p>
          )}
          {!contact.phone && !contact.birthDate && (
            <p className="text-muted-foreground">无信息</p>
          )}
          {contact.intro && (
            <Card>
              <CardHeader>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {contact.intro}
                </p>
              </CardHeader>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailDialog;
