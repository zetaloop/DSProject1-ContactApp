import { ContactType } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Mock API
export const fetchContacts = (): Promise<ContactType[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: uuidv4(),
          name: "张三",
          email: "zhangsan@example.com",
          phone: "123-456-7890",
          birthDate: "1990-01-01",
          intro: "软件工程师",
        },
        {
          id: uuidv4(),
          name: "李四",
          email: "lisi@example.com",
          birthDate: "1985-05-15",
          intro: "产品经理",
        },
      ]);
    }, 500);
  });
};

export const addContact = (
  contact: Omit<ContactType, "id">
): Promise<ContactType> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...contact, id: uuidv4() });
    }, 500);
  });
};

export const updateContact = (contact: ContactType): Promise<ContactType> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(contact);
    }, 500);
  });
};

export const deleteContact = (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

export const uploadImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        resolve(reader.result as string);
      }, 500);
    };
    reader.readAsDataURL(file);
  });
};
