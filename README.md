# blog

一个前后端分离的个人博客项目：前端使用 Vue 3 + Vite，后端使用 Node.js/Express + SQLite（better-sqlite3）。支持登录/注册、文章发布与编辑（类 Markdown 编辑 + 预览）、图片上传裁切、留言、文章可见性控制等。

## 功能特性

- **文章系统**：创建/编辑/删除、分类（随笔/科研/开发）、可见性（公开/登录可见/管理员可见）
- **正文编辑器**：类 Markdown 输入 + 一键预览渲染；支持 `lead/h2/p/quote/checklist(img)/code` 等模块
- **代码块**：`highlight.js` 语法高亮（语言可自动/手动选择）
- **图片**：
  - 文章内图片支持粘贴剪贴板图片上传并插入 `![](url)`
  - 列表封面裁切 **1:1**
  - 详情头图裁切 **1260:500**
- **用户系统**：注册/登录、个人中心（昵称/签名等）
- **留言板**：发表留言（管理员可删除）

## 技术栈

- **前端**：Vue 3、Vue Router、Pinia、Vite、Tailwind CSS、Axios、highlight.js
- **后端**：Node.js、Express、better-sqlite3、JWT、bcryptjs、multer、dotenv

## 目录结构

```text
blog/
  front/          # 前端（Vite）
  serve/          # 后端（Express + SQLite）
  pictures/       # 默认封面/头图资源（由后端静态托管）
```

## 本地开发

### 1) 启动后端

```bash
cd serve
npm install
copy .env.example .env
# 然后编辑 .env，至少设置 JWT_SECRET
npm run dev
```

后端默认地址：

- `http://localhost:3001`
- 健康检查：`GET /api/health`

静态资源：

- 默认图片：`/pictures/*` 或 `/picture/*`（来自仓库根目录 `pictures/`）
- 上传文件：`/uploads/*`（位于 `serve/data/uploads/`）

### 2) 启动前端

```bash
cd front
npm install
npm run dev
```

前端开发服务器默认会在 `http://localhost:5173`（Vite 默认端口）启动，并已在 `front/vite.config.js` 配置代理：

- `/api` → `http://localhost:3001`
- `/uploads` → `http://localhost:3001`

## 构建

```bash
cd front
npm run build
```

> 说明：目前仓库未包含“生产环境一键部署”脚本；如需将前端 `dist/` 部署到静态服务器并连接后端，请按你的部署环境（Nginx/PM2/Docker 等）配置反向代理到后端的 `/api` 与静态资源路径。

## 默认账号（开发环境）

后端启动时会自动 seed 数据，并确保存在一个管理员账号（定义在 `serve/src/seed.js`）：

- **管理员用户名**：`410327200401290010`
- **管理员密码**：`qwerdf1234123`

强烈建议在你上传 GitHub 前，**自行修改/移除**该默认密码逻辑（或改为从环境变量读取），避免误用到线上环境。

## 常见问题

### 图片默认路径为什么是 `/pictures/...`？

后端在 `serve/src/index.js` 中将仓库根目录的 `pictures/` 作为静态目录挂载到了 `/pictures` 与 `/picture`，用于文章默认封面/头图。

### 上传裁切后的图片存在哪里？

上传接口会把图片写到 `serve/data/uploads/` 下，并通过 `/uploads/...` 暴露为静态资源（开发环境可直接访问）。

## License

未指定（如需开源协议，请在根目录添加 `LICENSE`）。  

