# 🚀 Hướng Dẫn Rà Soát và Chạy Dự Án

## 📋 Tổng Quan Dự Án

**Creative Engineering Website** - Website B2B công nghiệp được xây dựng với:

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: TailwindCSS + shadcn/ui
- **i18n**: next-intl (hỗ trợ EN, VI, ZH, KO, JA)

---

## ✅ Rà Soát Dự Án

### 1. Cấu Trúc Dự Án

- ✅ Cấu trúc thư mục rõ ràng, tuân thủ Next.js 14 App Router
- ✅ Components được tổ chức tốt (admin, cart, layout, product, ui)
- ✅ API routes được tách biệt trong `src/app/api`
- ✅ Database schema hoàn chỉnh với Prisma
- ✅ i18n được cấu hình đúng với 5 ngôn ngữ

### 2. Dependencies

- ✅ `package.json` có đầy đủ dependencies cần thiết
- ✅ Next.js 14.2.21
- ✅ Prisma 6.1.0
- ✅ NextAuth 5.0.0-beta.25
- ✅ TypeScript 5.7.2

### 3. Configuration Files

- ✅ `tsconfig.json` - Cấu hình TypeScript đúng
- ✅ `next.config.mjs` - Cấu hình Next.js với next-intl
- ✅ `tailwind.config.ts` - Cấu hình TailwindCSS
- ✅ `prisma/schema.prisma` - Database schema đầy đủ

### 4. Database Schema

- ✅ User authentication với roles (ADMIN, EDITOR, CUSTOMER)
- ✅ Product catalog với images, specs, pricing
- ✅ Order management với payment tracking
- ✅ Blog system với categories và tags
- ✅ Contact messages
- ✅ Customer profiles và addresses

---

## 🔧 Yêu Cầu Hệ Thống

### Cần Cài Đặt:

1. **Node.js** (phiên bản 18 trở lên)
   - Tải từ: https://nodejs.org/
   - Hoặc dùng nvm: `nvm install 18`

2. **npm** (đi kèm với Node.js)

### Kiểm Tra Cài Đặt:

```powershell
node --version
npm --version
```

---

## 📝 Các Bước Thiết Lập

### Bước 1: Cài Đặt Node.js (Nếu chưa có)

**Windows:**

1. Tải Node.js từ https://nodejs.org/
2. Chạy installer và cài đặt
3. Mở lại PowerShell/Terminal
4. Kiểm tra: `node --version` và `npm --version`

**Hoặc dùng Chocolatey:**

```powershell
choco install nodejs
```

### Bước 2: Tạo File .env

Tạo file `.env` trong thư mục `web-ce2-main` với nội dung:

```env
# Database Configuration (SQLite for development)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth Configuration
AUTH_SECRET="creative-engineering-2024-secret-key-please-change-in-production"
AUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

**Lưu ý:** File `.env` có thể bị gitignore, bạn cần tạo thủ công.

### Bước 3: Cài Đặt Dependencies

```powershell
cd D:\ce\web-ce2-main\web-ce2-main
npm install
```

Thời gian: ~2-5 phút tùy tốc độ mạng.

### Bước 4: Generate Prisma Client

```powershell
npm run db:generate
```

Hoặc:

```powershell
npx prisma generate
```

### Bước 5: Setup Database

```powershell
# Push schema vào database
npm run db:push

# Seed dữ liệu mẫu
npm run db:seed
```

### Bước 6: Chạy Development Server

```powershell
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

---

## 🎯 Kiểm Tra Sau Khi Chạy

### 1. Trang Chủ

- URL: http://localhost:3000
- Kiểm tra: Hero section, services, partners

### 2. Trang Test Đơn Giản

- URL: http://localhost:3000/simple
- Kiểm tra: Cards, typography, colors

### 3. Admin Panel

- URL: http://localhost:3000/login
- Đăng nhập:
  - Email: `admin@ce.com.vn`
  - Password: `admin123`
- Sau đó vào: http://localhost:3000/admin

### 4. Product Catalog

- URL: http://localhost:3000/menu/product
- Kiểm tra: Product listing, filters, pagination

### 5. Blog

- URL: http://localhost:3000/blog
- Kiểm tra: Blog posts, categories

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "npm is not recognized"

**Nguyên nhân:** Node.js chưa được cài đặt hoặc chưa có trong PATH.

**Giải pháp:**

1. Cài đặt Node.js từ https://nodejs.org/
2. Mở lại PowerShell/Terminal
3. Kiểm tra: `node --version`

### Lỗi: "Cannot find module '@prisma/client'"

**Nguyên nhân:** Prisma client chưa được generate.

**Giải pháp:**

```powershell
npm run db:generate
```

### Lỗi: "Database does not exist"

**Nguyên nhân:** Database chưa được tạo.

**Giải pháp:**

```powershell
npm run db:push
```

### Lỗi: "Port 3000 is already in use"

**Nguyên nhân:** Port 3000 đã được sử dụng.

**Giải pháp:**

1. Tìm process đang dùng port 3000:
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Kill process hoặc đổi port trong `.env`:
   ```env
   PORT=3001
   ```

### Lỗi: "Module not found"

**Nguyên nhân:** Dependencies chưa được cài đặt.

**Giải pháp:**

```powershell
npm install
```

---

## 📊 Scripts Có Sẵn

```json
{
  "dev": "next dev", // Chạy development server
  "build": "next build", // Build production
  "start": "next start", // Chạy production server
  "lint": "next lint", // Kiểm tra lỗi code
  "db:generate": "prisma generate", // Generate Prisma client
  "db:push": "prisma db push", // Push schema vào database
  "db:seed": "tsx prisma/seed.ts", // Seed dữ liệu mẫu
  "db:studio": "prisma studio" // Mở Prisma Studio (GUI)
}
```

---

## 🔐 Tài Khoản Test

### Admin

- Email: `admin@ce.com.vn`
- Password: `admin123`
- Quyền: Quản lý toàn bộ (products, blog, orders)

### Customer

- Email: `customer@example.com`
- Password: `customer123`
- Quyền: Xem và đặt hàng

---

## 📁 Cấu Trúc Thư Mục Quan Trọng

```
web-ce2-main/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/           # API routes
│   │   └── [locale]/      # Internationalized pages
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   └── i18n/              # Translation files
├── public/                # Static assets
└── .env                   # Environment variables (cần tạo)
```

---

## ✅ Checklist Trước Khi Chạy

- [ ] Node.js đã được cài đặt (v18+)
- [ ] npm đã được cài đặt
- [ ] File `.env` đã được tạo với DATABASE_URL
- [ ] Dependencies đã được cài đặt (`npm install`)
- [ ] Prisma client đã được generate (`npm run db:generate`)
- [ ] Database đã được setup (`npm run db:push`)
- [ ] Database đã được seed (`npm run db:seed`)

---

## 🚀 Chạy Nhanh (Sau Khi Setup)

```powershell
# 1. Vào thư mục dự án
cd D:\ce\web-ce2-main\web-ce2-main

# 2. Chạy server
npm run dev

# 3. Mở browser: http://localhost:3000
```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra console logs trong terminal
2. Kiểm tra browser console (F12)
3. Xem các file hướng dẫn:
   - `README.md`
   - `START_NOW.md`
   - `READY_TO_TEST.md`

---

**Chúc bạn thành công! 🎉**
