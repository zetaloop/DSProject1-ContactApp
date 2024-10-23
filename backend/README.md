# Backend README

## 1. 安装依赖

```bash
python -m venv venv
source venv/bin/activate
# 对于 Windows:
# venv\Scripts\activate
pip install -r requirements.txt
```

依赖项:
- flask
- pywebview
- pyinstaller

## 2. 运行应用程序

```bash
python main.py
```

## 3. 后端结构

后端现在被模块化为以下组件：

- `main.py`: 处理服务器启动并隐藏控制台窗口。
- `server.py`: 包含服务器创建和路由逻辑。
- `data_persistence.py`: 处理数据持久化（加载和保存联系人）。
- `contact_list.py`: 处理联系人链表数据结构和相关操作。