import os
import sys
from server import create_app

PORT = 8848

if getattr(sys, "frozen", False):
    # Pyinstaller package
    STATICPATH = os.path.join(sys._MEIPASS, "static")  # type:ignore
    # ICONPATH = os.path.join(sys._MEIPASS, "favicon.png")
else:
    # Development mode
    STATICPATH = os.path.join(os.path.dirname(__file__), "../frontend/out")
    # ICONPATH = os.path.join(os.path.dirname(__file__), "../favicon.png")


def hide_console():
    """隐藏命令行窗口"""
    if sys.platform == "win32":
        import ctypes

        print("正在启动窗口，请稍等...")
        hwnd = ctypes.windll.kernel32.GetConsoleWindow()
        if hwnd != 0:
            ctypes.windll.user32.ShowWindow(hwnd, 0)
            ctypes.windll.kernel32.CloseHandle(hwnd)


def is_dark_mode():
    """检查 Windows 是否处于深色模式"""
    try:
        import winreg

        registry = winreg.ConnectRegistry(None, winreg.HKEY_CURRENT_USER)
        key = winreg.OpenKey(
            registry, r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"
        )
        value, _ = winreg.QueryValueEx(key, "AppsUseLightTheme")
        return value == 0
    except:
        return False


if __name__ == "__main__":
    hide_console()

    import threading
    import webview

    static_folder_path = STATICPATH
    production_mode = True

    if not os.path.isabs(static_folder_path):
        static_folder_path = os.path.abspath(static_folder_path)

    if not os.path.exists(static_folder_path):
        print(f"错误: 指定的静态文件路径不存在: {static_folder_path}")
        sys.exit(1)

    app = create_app(static_folder_path)
    flask_thread = threading.Thread(
        target=app.run, kwargs={"debug": not production_mode, "port": PORT}
    )
    flask_thread.daemon = True  # 守护线程
    flask_thread.start()

    webview.create_window(
        "联系人",
        f"http://127.0.0.1:{PORT}",
        width=1100,
        height=800,
        background_color="#09090b" if is_dark_mode() else "#ffffff",
    )
    # Windows pywebview 不支持自定义图标，其通过可执行文件指定图标
    # webview.start(icon=ICONPATH)
    webview.start()
