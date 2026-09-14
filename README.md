# Whale-Pet-web

[小鲸鱼桌宠](https://github.com/ErlangShen-AI/DeepSeek-Whale-Pet-Android) 的官网与安装包下载页。
页面内容取自软件仓库的介绍文档，安装包由软件仓库的 GitHub Actions 每天构建，再由本仓库的工作流同步到 `downloads/`。

## 目录

```text
├── index.html                 页面结构
├── style.css                  样式与自适应令牌
├── app.js                     页面填充与安装包信息
├── assets/                    鲸鱼贴图与动图
├── downloads/                 同步到这里的安装包与信息文件
└── .github/workflows/
    └── sync-apk.yml           每天取回安装包并提交
```

## 安装包同步

`sync-apk.yml` 每天北京时间 0 点执行：从软件仓库的 `latest` 发布取回 APK，同步说明文件与发布日志，
写入 `downloads/latest.json`（版本号、字节数、校验值、更新时间），有变化时提交一次。
每次运行结束后清理本仓库工作流的历史运行记录，仅保留最近 5 次。
也可以在 Actions 页面手动触发。

## 本地预览

页面是静态文件，直接打开 `index.html` 即可；安装包信息读取失败时进度信息隐藏，下载入口仍指向本地文件。

## 许可

MIT 协议。鲸鱼形象与气泡几何来自 [MeteorNOX/DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)。