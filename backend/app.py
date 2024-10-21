from __future__ import annotations
from flask import Flask, request, jsonify, send_from_directory
import base64
import os
import sys
import uuid


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


# 初始化联系人链表
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


def create_app(static_folder):
    app = Flask(__name__, static_folder=static_folder, static_url_path="/")

    # 获取联系人列表
    @app.route("/contacts", methods=["GET"])
    def get_contacts():
        return jsonify(contacts.to_data())

    # 添加联系人
    @app.route("/contacts", methods=["POST"])
    def add_contact():
        contact = request.get_json()
        if not contact:
            return jsonify({"error": "请求体不能为空"}), 400

        contact["id"] = str(uuid.uuid4())
        contacts.append(contact)
        return jsonify(contact), 201

    # 更新联系人
    @app.route("/contacts/<string:id>", methods=["PUT"])
    def update_contact(id):
        contact_data = request.get_json()
        if not contact_data:
            return jsonify({"error": "请求体不能为空"}), 400

        node = contacts.find(id)
        if not node:
            return jsonify({"error": "联系人未找到"}), 404

        node.contact = contact_data
        return jsonify(node.contact)

    # 删除联系人
    @app.route("/contacts/<string:id>", methods=["DELETE"])
    def delete_contact(id):
        node = contacts.find(id)
        if not node:
            return jsonify({"error": "联系人未找到"}), 404

        contacts.remove(node)
        return "", 204

    # 上传图片
    @app.route("/upload", methods=["POST"])
    def upload_image():
        if "file" not in request.files:
            return jsonify({"error": "未上传文件"}), 400
        file = request.files["file"]
        if file:
            data = file.read()
            base64_data = base64.b64encode(data).decode("utf-8")
            data_url = f"data:{file.content_type};base64,{base64_data}"
            return jsonify({"url": data_url})
        return jsonify({"error": "文件上传失败"}), 400

    # 更新联系人顺序
    @app.route("/contacts/order", methods=["PUT"])
    def update_contact_order():
        new_order = request.get_json()
        if not new_order:
            return jsonify({"error": "请求体不能为空"}), 400

        contacts.update_order(new_order)
        return jsonify(contacts.to_data())

    # 默认路由，返回前端的入口页面（例如 index.html）
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        assert app.static_folder is not None
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            # 如果路径不存在，则返回 index.html
            return send_from_directory(app.static_folder, "index.html")

    return app


# 启动应用
if __name__ == "__main__":
    static_folder_path = "../frontend/out"  # 默认静态文件路径
    production_mode = False  # 默认开发模式

    if len(sys.argv) > 1:
        static_folder_path = sys.argv[1]

    if len(sys.argv) > 2 and sys.argv[2].lower() == "production":
        production_mode = True

    if not os.path.isabs(static_folder_path):
        # 将相对路径转换为绝对路径
        static_folder_path = os.path.abspath(static_folder_path)

    if not os.path.exists(static_folder_path):
        print(f"错误: 指定的静态文件路径不存在: {static_folder_path}")
        sys.exit(1)

    app = create_app(static_folder_path)
    app.run(debug=not production_mode)

    print("用法: python app.py [静态文件路径] [模式]")
    print("[模式] 可以是 'production' 或 'development'，默认为 'development'")
