# Manga Admin Panel

基于 React + TypeScript + Ant Design 的漫画管理系统后台。

## 免责声明

⚠️ **重要声明**

1. 本项目仅供学习和技术研究使用，不得用于任何商业目的或非法用途。
2. 本项目不提供任何漫画内容，仅是一个内容管理系统框架。
3. 使用者需自行确保所管理的内容符合当地法律法规和版权要求。
4. 开发者不对使用本系统造成的任何直接或间接损失承担责任。
5. 使用本系统即表示您已阅读并同意以上声明。

## 功能特性

- ✅ 管理员登录（只支持 ADMIN 角色）
- ✅ 漫画列表展示
- ✅ 批量导入漫画（JSON 文件）
- ✅ 单个/批量删除漫画
- ✅ 响应式设计
- ✅ 图片预览
- ✅ 分页功能

## 技术栈

- React 18
- TypeScript
- Ant Design 5
- React Router 6
- Axios

## 快速开始

### 1. 安装依赖

```bash
cd admin-panel
npm install
```

### 2. 配置 API 地址

创建 `.env` 文件（参考 .env.example）：

```bash
REACT_APP_API_URL=http://localhost:8080
ESLINT_NO_DEV_ERRORS=true
```

或者直接修改 `src/config.ts` 中的 `API_BASE_URL`。

### 3. 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 启动。

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `build/` 目录。

## 使用说明

### 登录

1. 打开 http://localhost:3000
2. 使用管理员账号登录（必须是 ADMIN 角色）
3. 默认管理员账号：
   - 用户名：admin
   - 密码：admin123

### 漫画管理

#### 查看漫画列表

- 登录后自动进入漫画管理页面
- 显示漫画封面、标题、作者、状态等信息
- 支持分页浏览

#### 批量导入漫画

1. 点击「批量导入 JSON」按钮
2. 选择 JSON 文件（格式见下方）
3. 系统自动导入并刷新列表

**JSON 格式示例**：

```json
[
  {
    "title": "漫画标题",
    "oldName": "Manga Title",
    "description": "漫画简介描述...",
    "coverImageUrl": "manga/example/cover.jpg",
    "author": "作者名称",
    "isFinish": "2",
    "tendency": "1",
    "country": "1",
    "tags": ["冒险", "热血"],
    "chapters": [
      {
        "title": "第1话",
        "chapterNumber": 1,
        "pageUrls": [
          "manga/example/ch1/page1.jpg",
          "manga/example/ch1/page2.jpg"
        ]
      }
    ]
  }
]
```

**字段说明**：

- `isFinish`: "1" = 已完结, "2" = 连载中
- `tendency`: "1" = 少年, "2" = 少女, "3" = 青年
- `country`: "1" = 日本, "2" = 韩国, "3" = 中国, "4" = 其他

#### 删除漫画

**单个删除**：
1. 找到要删除的漫画
2. 点击「删除」按钮
3. 确认删除

**批量删除**：
1. 勾选要删除的漫画
2. 点击「批量删除」按钮
3. 确认删除

## 项目结构

```
admin-panel/
├── public/           # 静态资源
├── src/
│   ├── pages/        # 页面组件
│   │   ├── Login.tsx           # 登录页
│   │   ├── Login.css
│   │   ├── MangaManagement.tsx # 漫画管理页
│   │   └── MangaManagement.css
│   ├── services/     # API 服务
│   │   └── api.ts              # API 接口定义
│   ├── config.ts     # 配置文件
│   ├── App.tsx       # 主应用组件
│   ├── App.css
│   └── index.tsx     # 入口文件
├── package.json
└── README.md
```

## API 接口

### 登录

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 获取漫画列表

```
GET /api/manga?page=0&size=20
Authorization: Bearer {token}
```

### 批量导入漫画

```
POST /api/admin/manga/batch
Authorization: Bearer {token}
Content-Type: application/json

[{ ... manga data ... }]
```

### 删除漫画

```
DELETE /api/admin/manga/{id}
Authorization: Bearer {token}
```

### 批量删除漫画

```
POST /api/admin/manga/batch-delete
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

## 开发

### 修改 API 地址

方法 1: 环境变量（推荐）
```bash
# .env
REACT_APP_API_URL=http://your-api-server:8080
```

方法 2: 修改配置文件
```typescript
// src/config.ts
export const API_BASE_URL = 'http://your-api-server:8080';
```

### 修改端口

```bash
# .env
PORT=3001
```

或在启动时指定：
```bash
PORT=3001 npm start
```

## 部署

### 使用 Nginx

1. 构建项目：
```bash
npm run build
```

2. 将 `build/` 目录内容复制到 Nginx 目录

3. 配置 Nginx：
```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 反向代理 API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 使用 Docker

创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建并运行：
```bash
docker build -t manga-admin .
docker run -d -p 3000:80 manga-admin
```

## 常见问题

### Q: 登录后提示 "只有管理员可以登录"

A: 确保用户的 `role` 字段为 `ADMIN`。在数据库中检查用户表：
```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';
```

### Q: API 请求失败，CORS 错误

A: 后端需要配置 CORS：
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("*")
            .allowCredentials(true);
    }
}
```

### Q: 图片无法显示

A: 检查：
1. CDN_BASE_URL 是否正确配置
2. 图片路径是否正确
3. CDN 是否允许跨域访问

### Q: Token 过期后无法自动跳转登录

A: 检查 API 响应拦截器是否正确配置（已在 `src/services/api.ts` 中配置）

## License

MIT

## 支持

如有问题，请提 Issue。
