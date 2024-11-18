# Backend README

## 1. 安装依赖

请先准备好 [uv](https://docs.astral.sh/uv)

然后创建并进入虚拟环境
```bash
uv sync
source .venv/bin/activate
# 对于 Windows:
# .venv\Scripts\activate
```

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