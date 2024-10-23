import json
import os
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
    return None

def save_contacts(file_path, contact_list):
    """保存联系人到 data.json"""
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(contact_list.to_data(), file, ensure_ascii=False, indent=4)
