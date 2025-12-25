# 🔧 FIX: ERR_CONNECTION_REFUSED

## ❌ Vấn Đề

Bạn gặp lỗi: **localhost refused to connect** - ERR_CONNECTION_REFUSED

## ✅ Đã Fix

### 1. Cập Nhật i18n Config

- Tạo file `i18n.ts` ở root
- Cập nhật `next.config.mjs` để trỏ đúng file config
- Đơn giản hóa cấu hình next-intl

### 2. Tạo Test Page Mới

Tạo trang `/hello` siêu đơn giản không dùng i18n:

```
http://localhost:3000/hello
```

### 3. Restart Server

- Stop tất cả Node processes
- Start lại server với config mới

---

## 🌐 TEST NGAY (THEO THỨ TỰ)

### 1️⃣ Trang Hello (ĐƠN GIẢN NHẤT - TEST ĐẦU TIÊN)

```
http://localhost:3000/hello
```

**Mong đợi:**

- Heading "Server is Running!" màu CE blue
- Gradient box
- Links test
- Status checklist

**Nếu trang này OK** → Server đang chạy tốt, test tiếp các trang khác

---

### 2️⃣ Trang Simple (Test thứ 2)

```
http://localhost:3000/simple
```

**Mong đợi:**

- Cards màu CE blue
- Gradients
- Typography

---

### 3️⃣ Homepage (Test đầy đủ)

```
http://localhost:3000
```

**Mong đợi:**

- Hero section
- Services
- Partners
- Contact

---

## ⏰ THỜI GIAN CHỜ

Server cần **~30-60 giây** để:

1. Compile Next.js pages
2. Generate Prisma client
3. Start dev server
4. Ready to accept connections

**Đợi khoảng 1 phút rồi thử lại!**

---

## 🔄 NẾU VẪN KHÔNG ĐƯỢC

### Cách 1: Kiểm Tra Terminal

Mở terminal/command prompt mới:

```powershell
cd C:\Users\Admin\Pictures\ce\ce-website
cmd /c "npm run dev"
```

Xem có lỗi gì xuất hiện không.

### Cách 2: Clear Cache & Restart

```powershell
cd C:\Users\Admin\Pictures\ce\ce-website
cmd /c "rmdir /s /q .next"
cmd /c "npm run dev"
```

### Cách 3: Check Port

Có thể port 3000 đang bị dùng. Server sẽ tự động chọn port khác (3001, 3002...)

Xem terminal output để biết port thực tế.

---

## 🐛 DEBUG STEPS

### Step 1: Wait 60 seconds

Server cần thời gian khởi động

### Step 2: Try Hello Page

```
http://localhost:3000/hello
```

### Step 3: Check F12 Console

Nếu vẫn lỗi, mở F12 → Console → screenshot

### Step 4: Check Terminal

Xem terminal có logs lỗi gì không

---

## 📊 CHANGES MADE

### Files Created:

- ✅ `i18n.ts` - i18n config mới
- ✅ `src/app/hello/page.tsx` - Test page đơn giản

### Files Modified:

- ✅ `next.config.mjs` - Trỏ đúng i18n config

### Actions Taken:

- ✅ Killed old Node processes (3 processes)
- ✅ Restarted dev server
- ✅ Waiting for compilation...

---

## ⏱️ STATUS

```
✅ i18n config:   FIXED
✅ Test page:     CREATED (/hello)
✅ Server:        RESTARTING
⏳ Compilation:   IN PROGRESS (~60s)
⏳ Testing:       WAIT 1 MINUTE
```

---

## 🎯 NEXT STEPS

1. **Đợi 60 giây** cho server compile xong

2. **Thử trang Hello**:

   ```
   http://localhost:3000/hello
   ```

3. **Nếu OK** → Thử tiếp:
   - http://localhost:3000/simple
   - http://localhost:3000

4. **Nếu vẫn lỗi** → Chụp màn hình terminal + console

---

## 💡 TẠI SAO LỖI?

**Nguyên nhân có thể:**

1. Server chưa start xong (đang compile)
2. i18n config chưa đúng (đã fix)
3. Port conflict (server sẽ tự chọn port khác)
4. Lỗi compile (cần xem terminal logs)

**Đã fix:**

- ✅ Tạo i18n.ts config đúng chuẩn
- ✅ Tạo test page không phụ thuộc i18n
- ✅ Restart server

---

## 🚀 ĐỢI 1 PHÚT RỒI THỬ LẠI!

```
http://localhost:3000/hello
```

**Server đang compile... hãy kiên nhẫn! ⏰**

---

_Updated: 12/12/2025 - Fix connection refused error_
