from __future__ import annotations
from flask import Flask, request, jsonify, send_from_directory
import base64
import os
import sys
import uuid
from data_persistence import load_contacts, save_contacts
from contact_list import ContactList

# 初始化联系人链表
contacts = load_contacts("./data.json")


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
        save_contacts("./data.json", contacts)
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

        contact_data["id"] = id  # 确保ID不变
        node.contact = contact_data
        save_contacts("./data.json", contacts)
        return jsonify(node.contact)

    # 删除联系人
    @app.route("/contacts/<string:id>", methods=["DELETE"])
    def delete_contact(id):
        node = contacts.find(id)
        if not node:
            return jsonify({"error": "联系人未找到"}), 404

        contacts.remove(node)
        save_contacts("./data.json", contacts)
        return "", 204

    # 上传联系人图片
    @app.route("/contacts/<string:id>/image", methods=["POST"])
    def upload_image(id):
        node = contacts.find(id)
        if not node:
            return jsonify({"error": "联系人未找到"}), 404

        if "file" not in request.files:
            return jsonify({"error": "未上传文件"}), 400

        file = request.files["file"]
        if file:
            data = file.read()
            base64_data = base64.b64encode(data).decode("utf-8")
            data_url = f"data:{file.content_type};base64,{base64_data}"
            node.contact["image"] = data_url
            save_contacts("./data.json", contacts)
            return jsonify({"url": data_url})
        return jsonify({"error": "文件上传失败"}), 400

    # 更新联系人顺序
    @app.route("/contacts", methods=["PATCH"])
    def update_contact_order():
        new_order = request.get_json()
        if not new_order:
            return jsonify({"error": "请求体不能为空"}), 400

        if not isinstance(new_order, list):
            return jsonify({"error": "请求体应为ID列表"}), 400

        contacts.update_order(new_order)
        save_contacts("./data.json", contacts)
        return jsonify(contacts.to_data())

    # 移动联系人位置
    @app.route("/contacts/<string:id>/position", methods=["PUT"])
    def move_contact(id):
        position_data = request.get_json()
        if not position_data:
            return jsonify({"error": "请求体不能为空"}), 400

        target_id = position_data.get("target_id")
        position = position_data.get("position")  # "before" 或 "after"
        if not target_id or position not in ["before", "after"]:
            return jsonify({"error": "请求参数不正确"}), 400

        node_to_move = contacts.find(id)
        target_node = contacts.find(target_id)
        if not node_to_move or not target_node:
            return jsonify({"error": "联系人未找到"}), 404

        if position == "before":
            contacts.move_before(node_to_move, target_node)
        elif position == "after":
            contacts.move_after(node_to_move, target_node)

        save_contacts("./data.json", contacts)
        return jsonify(contacts.to_data())

    # 删除联系人图片
    @app.route("/contacts/<string:id>/image", methods=["DELETE"])
    def delete_image(id):
        node = contacts.find(id)
        if not node:
            return jsonify({"error": "联系人未找到"}), 404

        if "picture" in node.contact:
            del node.contact["picture"]
            save_contacts("./data.json", contacts)
            return "", 204
        return jsonify({"error": "联系人没有图片"}), 404

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
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
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
