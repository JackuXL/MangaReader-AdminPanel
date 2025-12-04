# Manga Admin Panel

A manga management system backend built with React + TypeScript + Ant Design.

## Disclaimer

⚠️ **Important Notice**

1. This project is for educational and technical research purposes only. It must not be used for any commercial purposes or illegal activities.
2. This project does not provide any manga content; it is merely a content management system framework.
3. Users are responsible for ensuring that the content they manage complies with local laws, regulations, and copyright requirements.
4. The developers assume no responsibility for any direct or indirect damages caused by the use of this system.
5. By using this system, you acknowledge that you have read and agree to the above statements.

## Features

- ✅ Admin login (ADMIN role only)
- ✅ Manga list display
- ✅ Batch import manga (JSON file)
- ✅ Single/batch delete manga
- ✅ Responsive design
- ✅ Image preview
- ✅ Pagination

## Tech Stack

- React 18
- TypeScript
- Ant Design 5
- React Router 6
- Axios

## Quick Start

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Configure API URL

Create a `.env` file (refer to .env.example):

```bash
REACT_APP_API_URL=http://localhost:8080
ESLINT_NO_DEV_ERRORS=true
```

Or modify `API_BASE_URL` in `src/config.ts` directly.

### 3. Start Development Server

```bash
npm start
```

The app will start at http://localhost:3000.

### 4. Build for Production

```bash
npm run build
```

Build output is in the `build/` directory.

## Usage

### Login

1. Open http://localhost:3000
2. Login with an admin account (must have ADMIN role)
3. Default admin credentials:
   - Username: admin
   - Password: admin123

### Manga Management

#### View Manga List

- After login, you'll automatically enter the manga management page
- Displays manga cover, title, author, status, etc.
- Supports pagination

#### Batch Import Manga

1. Click the "Batch Import JSON" button
2. Select a JSON file (format shown below)
3. The system will automatically import and refresh the list

**JSON Format Example**:

```json
[
  {
    "title": "Manga Title",
    "oldName": "Original Title",
    "description": "Manga description...",
    "coverImageUrl": "manga/example/cover.jpg",
    "author": "Author Name",
    "isFinish": "2",
    "tendency": "1",
    "country": "1",
    "tags": ["Adventure", "Action"],
    "chapters": [
      {
        "title": "Chapter 1",
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

**Field Descriptions**:

- `isFinish`: "1" = Completed, "2" = Ongoing
- `tendency`: "1" = Shounen, "2" = Shoujo, "3" = Seinen
- `country`: "1" = Japan, "2" = Korea, "3" = China, "4" = Other

#### Delete Manga

**Single Delete**:
1. Find the manga to delete
2. Click the "Delete" button
3. Confirm deletion

**Batch Delete**:
1. Check the manga to delete
2. Click the "Batch Delete" button
3. Confirm deletion

## Project Structure

```
admin-panel/
├── public/           # Static resources
├── src/
│   ├── pages/        # Page components
│   │   ├── Login.tsx           # Login page
│   │   ├── Login.css
│   │   ├── MangaManagement.tsx # Manga management page
│   │   └── MangaManagement.css
│   ├── services/     # API services
│   │   └── api.ts              # API interface definitions
│   ├── config.ts     # Configuration file
│   ├── App.tsx       # Main app component
│   ├── App.css
│   └── index.tsx     # Entry file
├── package.json
└── README.md
```

## API Endpoints

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Get Manga List

```
GET /api/manga?page=0&size=20
Authorization: Bearer {token}
```

### Batch Import Manga

```
POST /api/admin/manga/batch
Authorization: Bearer {token}
Content-Type: application/json

[{ ... manga data ... }]
```

### Delete Manga

```
DELETE /api/admin/manga/{id}
Authorization: Bearer {token}
```

### Batch Delete Manga

```
POST /api/admin/manga/batch-delete
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

## Development

### Modify API URL

Method 1: Environment Variables (Recommended)
```bash
# .env
REACT_APP_API_URL=http://your-api-server:8080
```

Method 2: Modify Configuration File
```typescript
// src/config.ts
export const API_BASE_URL = 'http://your-api-server:8080';
```

### Change Port

```bash
# .env
PORT=3001
```

Or specify when starting:
```bash
PORT=3001 npm start
```

## Deployment

### Using Nginx

1. Build the project:
```bash
npm run build
```

2. Copy `build/` directory contents to Nginx directory

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy for API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Using Docker

Create a `Dockerfile`:
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

Build and run:
```bash
docker build -t manga-admin .
docker run -d -p 3000:80 manga-admin
```

## FAQ

### Q: After login, it shows "Only administrators can login"

A: Ensure the user's `role` field is `ADMIN`. Check the users table in the database:
```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';
```

### Q: API request failed with CORS error

A: Backend needs CORS configuration:
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

### Q: Images not displaying

A: Check:
1. Is CDN_BASE_URL correctly configured?
2. Are image paths correct?
3. Does the CDN allow cross-origin access?

### Q: Token expiration doesn't automatically redirect to login

A: Check if the API response interceptor is correctly configured (already configured in `src/services/api.ts`)

## License

MIT

## Support

For issues, please submit an Issue.

