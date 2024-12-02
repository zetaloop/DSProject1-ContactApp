"use client";

import { useState, useEffect } from "react";
import { ContactType } from "@/types";
import ContactTable from "./contact-table";
import ContactForm from "./window-edit";
import ContactDetailDialog from "./window-detail";
import {
  fetchContacts,
  addContact,
  updateContact,
  deleteContact,
  uploadImage,
  updateContactOrder,
  moveContact,
  deleteImage,
} from "@/api/contacts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<ContactType | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailedContact, setDetailedContact] = useState<ContactType | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts().then((data) => {
      setContacts(data);
      setIsLoading(false);
    });
  }, []);

  const handleAdd = () => {
    setCurrentContact(null);
    setIsFormOpen(true);
  };

  const handleEdit = (contact: ContactType) => {
    setCurrentContact(contact);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteContact(id);
    setContacts(contacts.filter((c) => c.id !== id));
    toast({ title: "联系人已删除" });
  };

  const handleRowClick = (contact: ContactType) => {
    setDetailedContact(contact);
    setIsDetailOpen(true);
  };

  const handleSave = async (
    contactData: Omit<ContactType, "id">,
    selectedFile: File | null
  ) => {
    try {
      let pictureUrl = contactData.picture;

      if (currentContact) {
        // 更新现有联系人
        if (selectedFile) {
          pictureUrl = await uploadImage(currentContact.id, selectedFile);
        }
        const updatedContact = await updateContact({
          ...contactData,
          id: currentContact.id,
          picture: pictureUrl,
        });
        setContacts(
          contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c))
        );
        toast({ title: "联系人已更新" });
      } else {
        // 添加新联系人
        const newContact = await addContact({
          ...contactData,
          picture: undefined, // 新建时先不设置图片
        });
        if (selectedFile) {
          pictureUrl = await uploadImage(newContact.id, selectedFile);
          newContact.picture = pictureUrl;
          await updateContact(newContact);
        }
        setContacts([...contacts, newContact]);
        toast({ title: "联系人已添加" });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "操作失败",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (newOrder: ContactType[]) => {
    setContacts(newOrder);
    const newOrderIds = newOrder.map((contact) => contact.id);
    await updateContactOrder(newOrderIds);
  };

  const handleMoveContact = async (
    id: string,
    targetId: string,
    position: "before" | "after"
  ) => {
    const updatedContacts = await moveContact(id, targetId, position);
    setContacts(updatedContacts);
  };

  const handleDeleteImage = async (id: string) => {
    await deleteImage(id);
    setContacts(
      contacts.map((c) => (c.id === id ? { ...c, picture: undefined } : c))
    );
    toast({ title: "头像已删除" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4">联系人</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">联系人</h1>
      <Button variant="outline" onClick={handleAdd}>
        添加联系人
      </Button>
      <ContactForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        currentContact={currentContact}
        onSave={handleSave}
        onDeleteImage={handleDeleteImage}
      />
      <ContactTable
        contacts={contacts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        onDragEnd={handleDragEnd}
        onMoveContact={handleMoveContact}
      />
      {detailedContact && (
        <ContactDetailDialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          contact={detailedContact}
        />
      )}
    </div>
  );
};

export default ContactPage;
