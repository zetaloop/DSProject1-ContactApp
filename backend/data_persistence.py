import json
import os
import uuid
from contact_list import ContactList


def load_contacts(file_path):
    """从 data.json 加载联系人"""
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            contact_list = ContactList()
            for contact in data:
                contact_list.append(contact)
            return contact_list
    contacts = ContactList()
    # 添加默认的测试数据
    contacts.append(
        {
            "id": str(uuid.uuid4()),
            "name": "张三",
            "email": "zhangsan@example.com",
            "phone": "123-456-7890",
            "birthDate": "1990-01-01",
            "intro": "软件工程师",
        }
    )
    contacts.append(
        {
            "id": str(uuid.uuid4()),
            "name": "李四",
            "email": "lisi@example.com",
            "birthDate": "1985-05-15",
            "intro": "产品经理",
        }
    )
    return contacts


def save_contacts(file_path, contact_list):
    """保存联系人到 data.json"""
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(contact_list.to_data(), file, ensure_ascii=False, indent=4)
