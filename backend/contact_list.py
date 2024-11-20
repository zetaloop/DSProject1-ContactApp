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
        """获取所有联系人节点列表"""
        nodes = []
        current = self.head
        while current:
            nodes.append(current)
            current = current.next
        return nodes

    def to_data(self):
        """获取所有联系人数据，包含前后关系"""
        contacts = []
        current = self.head
        while current:
            contact_data = current.contact.copy()
            contact_data["prev_id"] = (
                current.prev.contact["id"] if current.prev else None
            )
            contact_data["next_id"] = (
                current.next.contact["id"] if current.next else None
            )
            contacts.append(contact_data)
            current = current.next
        return contacts

    def update_order(self, new_order):
        """更新联系人顺序"""
        id_to_node = {node.contact["id"]: node for node in self.to_list()}
        self.head = self.tail = None
        for contact_id in new_order:
            node = id_to_node.get(contact_id)
            if not node:
                continue  # 如果ID不存在，跳过或可选择抛出异常
            node.prev = node.next = None  # 重置节点的前后指针
            if not self.head or not self.tail:
                self.head = self.tail = node
            else:
                self.tail.next = node
                node.prev = self.tail
                self.tail = node

    def insert_before(self, target_node, new_node):
        """在指定节点之前插入新节点"""
        new_node.prev = target_node.prev
        new_node.next = target_node
        if target_node.prev:
            target_node.prev.next = new_node
        else:
            self.head = new_node
        target_node.prev = new_node

    def insert_after(self, target_node, new_node):
        """在指定节点之后插入新节点"""
        new_node.next = target_node.next
        new_node.prev = target_node
        if target_node.next:
            target_node.next.prev = new_node
        else:
            self.tail = new_node
        target_node.next = new_node

    def move_before(self, node_to_move, target_node):
        """将节点移动到另一个节点之前"""
        if node_to_move == target_node:
            return  # 无需移动
        self.remove(node_to_move)
        self.insert_before(target_node, node_to_move)

    def move_after(self, node_to_move, target_node):
        """将节点移动到另一个节点之后"""
        if node_to_move == target_node:
            return  # 无需移动
        self.remove(node_to_move)
        self.insert_after(target_node, node_to_move)
