import { ContactType } from "@/types";

// 前后端在同一域名和端口
const API_BASE_URL = "";

// 获取联系人列表
export const fetchContacts = async (): Promise<ContactType[]> => {
  const response = await fetch(`${API_BASE_URL}/contacts`);
  if (!response.ok) {
    throw new Error("获取联系人列表失败");
  }
  const data = await response.json();
  return data;
};

// 添加联系人
export const addContact = async (
  contact: Omit<ContactType, "id">
): Promise<ContactType> => {
  const response = await fetch(`${API_BASE_URL}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });
  if (!response.ok) {
    throw new Error("添加联系人失败");
  }
  const data = await response.json();
  return data;
};

// 更新联系人
export const updateContact = async (
  contact: ContactType
): Promise<ContactType> => {
  const response = await fetch(`${API_BASE_URL}/contacts/${contact.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });
  if (!response.ok) {
    throw new Error("更新联系人失败");
  }
  const data = await response.json();
  return data;
};

// 删除联系人
export const deleteContact = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("删除联系人失败");
  }
};

// 上传图片
export const uploadImage = async (id: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/contacts/${id}/image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("图片上传失败");
  }

  const data = await response.json();
  return data.url;
};

// 更新联系人顺序
export const updateContactOrder = async (
  newOrder: string[]
): Promise<ContactType[]> => {
  const response = await fetch(`${API_BASE_URL}/contacts`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newOrder),
  });
  if (!response.ok) {
    throw new Error("更新联系人顺序失败");
  }
  const data = await response.json();
  return data;
};

// 移动联系人位置
export const moveContact = async (
  id: string,
  targetId: string,
  position: "before" | "after"
): Promise<ContactType[]> => {
  const response = await fetch(`${API_BASE_URL}/contacts/${id}/position`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target_id: targetId, position }),
  });
  if (!response.ok) {
    throw new Error("移动联系人位置失败");
  }
  const data = await response.json();
  return data;
};

// 删除联系人图片
export const deleteImage = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/contacts/${id}/image`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("删除图片失败");
  }
};
