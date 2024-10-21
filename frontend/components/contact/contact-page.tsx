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
} from "@/api/contacts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { onDragEnd } from "./contact-table"; // Import onDragEnd function

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
    let pictureUrl;
    if (selectedFile) {
      pictureUrl = await uploadImage(selectedFile);
    }
    if (currentContact) {
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
      const newContact = await addContact({
        ...contactData,
        picture: pictureUrl,
      });
      setContacts([...contacts, newContact]);
      toast({ title: "联系人已添加" });
    }
    setIsFormOpen(false);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = contacts.findIndex((contact) => contact.id === active.id);
      const newIndex = contacts.findIndex((contact) => contact.id === over.id);

      const newContacts = arrayMove(contacts, oldIndex, newIndex);

      setContacts(newContacts);

      try {
        await moveContact(active.id, newIndex);
      } catch (error) {
        console.error("Failed to move contact:", error);
      }
    }
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
      />
      <ContactTable
        contacts={contacts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        onDragEnd={handleDragEnd} // Pass handleDragEnd function to ContactTable component
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
