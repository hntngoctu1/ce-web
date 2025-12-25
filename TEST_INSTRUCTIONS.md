# 🧪 HƯỚNG DẪN TEST - CE WEBSITE

## ✅ Đã Fix (Vừa xong)

### Lỗi CSS Syntax Error

- **Vấn đề**: Line 188 có dấu `}` thừa
- **Nguyên nhân**: Utility classes bị nằm ngoài `@layer utilities` block
- **Đã fix**: Di chuyển tất cả utilities vào trong layer
- **Kết quả**: ✅ Build thành công

### Server Status

- ✅ Đã stop tất cả Node processes cũ
- ✅ Đang chạy `npm run dev` ở background
- ✅ Server đang compile...

---

## 🔍 CÁC TRANG CẦN TEST

### 1. Trang Test Đơn Giản

Truy cập các trang này để xem cơ bản:

```
✅ http://localhost:3000/simple
   - Trang đơn giản nhất, không dùng database
   - Hiển thị cards với màu CE
   - Test gradients và animations

✅ http://localhost:3000/test
   - Test page với CE colors
   - Card components
```

### 2. Trang Chính (Homepage)

```
✅ http://localhost:3000
   - Hero section với gradient background
   - Services carousel (4 services)
   - Partners section
   - Contact section
```

### 3. Các Trang Công Ty

```
✅ http://localhost:3000/envision
   - Hero về innovation

✅ http://localhost:3000/engage
   - Hero về collaboration

✅ http://localhost:3000/entrench
   - Hero về durability
```

### 4. Menu - Industrial

```
✅ http://localhost:3000/menu/industrial
   - Slider với 7 danh mục công nghiệp
   - Prev/Next buttons
```

### 5. Menu - Product (E-commerce)

```
✅ http://localhost:3000/menu/product
   - Product catalog với grid
   - Left sidebar (product groups)
   - Search box
   - "Add to Cart" buttons

✅ http://localhost:3000/product/[slug]
   - Chi tiết sản phẩm
   - Image gallery
   - Specifications
   - Related products
   - Add to Cart functionality
```

### 6. Shopping Cart

```
✅ Click vào Cart icon (top-right header)
   - Sheet slide-in từ bên phải
   - Hiển thị items trong cart
   - Quantity controls (+/-)
   - Remove item
   - Total price
   - Checkout button
```

### 7. Blog

```
✅ http://localhost:3000/blog
   - Blog listing page
   - Categories filter
   - Search box
   - Cards với image + excerpt

✅ http://localhost:3000/blog/[slug]
   - Full blog post
   - Rich text content
   - Related posts
```

### 8. Contact

```
✅ http://localhost:3000/contact
   - Contact form (Name, Email, Phone, Company, Message)
   - Office info (Ho Chi Minh + Ha Noi)
   - Submit button
```

### 9. Authentication

```
✅ http://localhost:3000/login
   - Login form
   - Test accounts:
     * admin@ce.com / admin123
     * customer@ce.com / customer123

✅ http://localhost:3000/register
   - Registration form
   - Create new account
```

### 10. Customer Dashboard (Sau khi login)

```
✅ http://localhost:3000/dashboard
   - Personal info
   - Order history
   - Loyalty points
   - Order status tracker
```

### 11. Admin CMS (Login as admin)

```
✅ http://localhost:3000/admin
   - Dashboard với summary cards
   - Total products, orders, contacts

✅ http://localhost:3000/admin/products
   - Product list table
   - Search, filter, pagination
   - Edit/Delete buttons
   - Create New Product button

✅ http://localhost:3000/admin/products/new
   - Product creation form
   - Image upload
   - Specifications (key/value pairs)
   - Multiple images

✅ http://localhost:3000/admin/blog
   - Blog post list
   - Create/Edit/Delete

✅ http://localhost:3000/admin/blog/new
   - Rich text editor (TipTap)
   - Cover image upload
   - Categories & tags
   - Publish toggle
```

---

## 🎨 ĐIỂM CẦN KIỂM TRA

### Design & Styling

- [ ] Màu CE blue (#676E9F) hiển thị đúng
- [ ] Font Lato load đúng
- [ ] Gradient backgrounds (light/dark)
- [ ] Circle patterns (subtle backgrounds)
- [ ] Animations (fade-up effects)
- [ ] Hover effects trên buttons/cards
- [ ] Responsive design (thử resize window)

### Functionality

- [ ] Navigation menu hoạt động
- [ ] Language switcher (EN/VI)
- [ ] Shopping cart (add/remove items)
- [ ] Product search & filter
- [ ] Form submissions (contact, register)
- [ ] Login/logout
- [ ] Admin CRUD operations
- [ ] Image uploads

### Responsive

- [ ] Mobile view (< 640px)
- [ ] Tablet view (640-1024px)
- [ ] Desktop view (> 1024px)
- [ ] Header sticky khi scroll
- [ ] Mobile menu (hamburger)

---

## 🐛 NẾU GẶP LỖI

### Trang vẫn trống sau khi restart?

1. **Check Browser Console** (F12):
   - Tab Console → xem JavaScript errors
   - Tab Network → xem failed requests

2. **Check Terminal** (nơi chạy npm run dev):
   - Xem có compilation errors không
   - Xem server đã start xong chưa

3. **Hard Refresh**:
   - Windows: `Ctrl + Shift + R`
   - Clear browser cache

### Database chưa có data?

```powershell
cd C:\Users\Admin\Pictures\ce\ce-website
cmd /c "npx prisma generate"
cmd /c "npx prisma db push"
cmd /c "npx prisma db seed"
```

### Styles không áp dụng?

- Restart dev server lại một lần nữa
- Clear .next folder: `cmd /c "rmdir /s /q .next"`
- Chạy lại: `cmd /c "npm run dev"`

---

## ✅ CHECKLIST HOÀN THÀNH

### Phase 1: Basic Pages (Test này trước)

- [ ] Homepage hiển thị với hero + services
- [ ] Header với logo + navigation
- [ ] Footer với contact info
- [ ] Envision/Engage/Entrench pages
- [ ] CSS colors và fonts đúng

### Phase 2: E-commerce

- [ ] Product listing page
- [ ] Product detail page
- [ ] Shopping cart functionality
- [ ] Checkout page
- [ ] Order creation

### Phase 3: Content

- [ ] Blog listing
- [ ] Blog post detail
- [ ] Contact form
- [ ] Language switcher

### Phase 4: Authentication

- [ ] Login page
- [ ] Register page
- [ ] Customer dashboard
- [ ] Protected routes

### Phase 5: Admin CMS

- [ ] Admin dashboard
- [ ] Product CRUD
- [ ] Blog CRUD
- [ ] Image uploads
- [ ] Rich text editor

---

## 📊 EXPECTED RESULTS

Nếu mọi thứ OK, bạn sẽ thấy:

1. **Homepage**: Hero section màu gradient xám nhạt, có animation fade-up, 4 service cards, partner logos, contact section với 2 offices

2. **Product Page**: Grid của products, sidebar filters, search box hoạt động, "Add to Cart" buttons

3. **Admin**: Clean dashboard với tables, forms hoạt động, image upload OK, rich text editor load

4. **Mobile**: Responsive tốt, hamburger menu, layouts stack vertically

---

## 🚀 NEXT STEPS (Sau khi test xong)

1. **Nếu mọi thứ OK**:
   - [ ] Test production build: `npm run build`
   - [ ] Deploy lên Vercel/Railway
   - [ ] Chuyển từ SQLite sang PostgreSQL
   - [ ] Setup S3 cho image storage

2. **Nếu có bugs**:
   - [ ] Screenshot errors
   - [ ] Copy error messages từ console
   - [ ] Báo lại để fix

---

**Server hiện đang chạy ở background. Mở browser và test ngay! 🎉**
