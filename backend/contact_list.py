from __future__ import annotations

class ContactNode:
    """联系人节点"""

    prev: None | ContactNode
    next: None | ContactNode

    def __init__(self, contact):
        self.contact = contact
        self.prev = None
        self.next = None


class ContactList:
    """联系人双向链表"""

    head: None | ContactNode
    tail: None | ContactNode

    def __init__(self):
        self.head = None
        self.tail = None

    def append(self, contact):
        """添加联系人到链表末尾"""
        node = ContactNode(contact)
        if not self.head or not self.tail:
            self.head = self.tail = node
        else:
            self.tail.next = node
            node.prev = self.tail
            self.tail = node

    def find(self, contact_id):
        """根据 ID 查找联系人"""
        current = self.head
        while current:
            if current.contact["id"] == contact_id:
                return current
            current = current.next
        return None

    def remove(self, node):
        """删除指定联系人"""
        if node.prev:
            node.prev.next = node.next
        else:
            self.head = node.next

        if node.next:
            node.next.prev = node.prev
        else:
            self.tail = node.prev

    def to_list(self):
        """获取所有联系人"""
        nodes = []
        current = self.head
        while current:
            nodes.append(current)
            current = current.next
        return nodes

    def to_data(self):
        """获取所有联系人数据"""
        contacts = []
        current = self.head
        while current:
            contacts.append(current.contact)
            current = current.next
        return contacts

    def update_order(self, new_order):
        """更新联系人顺序"""
        id_to_node = {node.contact["id"]: node for node in self.to_list()}
        self.head = self.tail = None
        for contact_id in new_order:
            node = id_to_node[contact_id]
            if not self.head or not self.tail:
                self.head = self.tail = node
                node.prev = node.next = None
            else:
                self.tail.next = node
                node.prev = self.tail
                node.next = None
                self.tail = node
