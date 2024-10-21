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
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ContactTableProps {
  contacts: ContactType[];
  onEdit: (contact: ContactType) => void;
  onDelete: (id: string) => void;
  onRowClick: (contact: ContactType) => void;
  onDragEnd: (newOrder: ContactType[]) => void;
}

const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </TableRow>
  );
};

const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onEdit,
  onDelete,
  onRowClick,
  onDragEnd,
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = contacts.findIndex((contact) => contact.id === active.id);
      const newIndex = contacts.findIndex((contact) => contact.id === over.id);
      const newOrder = arrayMove(contacts, oldIndex, newIndex);
      onDragEnd(newOrder);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={contacts.map((contact) => contact.id)} strategy={verticalListSortingStrategy}>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>拖拽</TableHead>
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
              <SortableItem key={contact.id} id={contact.id}>
                <TableCell>
                  <span>::</span>
                </TableCell>
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
              </SortableItem>
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
};

export default ContactTable;
