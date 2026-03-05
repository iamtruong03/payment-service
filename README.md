# Hệ thống Thanh toán (Payment System) - Next.js & Spring Boot

## 🚀 Công nghệ sử dụng (Tech Stack)

### 1. Frontend (Next.js 14)
- **Framework:** Next.js 14 (sử dụng kiến trúc **App Router** `src/app`).
- **Ngôn ngữ:** TypeScript.
- **Quản lý dữ liệu gọi mạng (Data Flow & Fetching):** TanStack React Query kết hợp với Axios.
- **Quản lý trạng thái cục bộ (State Management):** Zustand (nhẹ và linh hoạt hơn Redux).
- **Giao diện & Styling:** Tailwind CSS, Shadcn UI, Radix UI, Lucide Icons.
- **Xử lý Form & Validate:** React Hook Form & Zod.
- **Bảo vệ luồng (Routing Security):** Next.js Server Route Handlers (ẩn JWT Token và tránh lỗi CORS).
- **Thanh toán:** `@stripe/react-stripe-js` (Stripe Elements).

### 2. Backend (Spring Boot 3)
- **Framework Lõi:** Java Spring Boot.
- **Bảo mật (Security):** Spring Security kết hợp JSON Web Token (JWT) để xác thực (Authentication) và phân quyền (Authorization - phân tách `ROLE_USER` và `ROLE_ADMIN`).
- **Tương tác Cơ sở dữ liệu:** Spring Data JPA / Hibernate.
- **Cơ sở dữ liệu:** PostgreSQL (Lưu trữ thông tin người dùng, trạng thái giao dịch, logs hệ thống).
- **Cổng thanh toán:** Stripe Java SDK.

---

## 🔧 Các tính năng chính của hệ thống

### 🎭 Phân hệ Người dùng (User)
- Đăng nhập, Đăng ký bằng JWT (JSON Web Token).
- Cập nhật thông tin cá nhân cơ bản.
- Trải nghiệm giao diện thân thiện, responsive mọi thiết bị.

### 💳 Phân hệ Thanh toán (Payment)
- Luồng thanh toán bảo mật với Stripe Elements (tạo Payment Intent ở server, xác nhận ở client).
- Quản lý trạng thái giao dịch đồng bộ qua Stripe Webhook (Thành công, Thất bại, Hủy bỏ).
- Khả năng **Tiếp tục thanh toán (Resume Payment):** Người dùng có rớt mạng hoặc quay lại sau vẫn có thể hoàn tất giao dịch đang dang dở.
- Hiển thị danh sách Giao dịch cá nhân dạng lướt (Dashboard).
- Hiển thị Chi Tiết Giao Dịch (Modal chi tiết).

### 🛠 Phân hệ Quản trị (Admin)
*(Quyền truy cập: `ROLE_ADMIN`)*
- Xem thống kê tổng quan toàn hệ thống (Tổng doanh thu, số lượng giao dịch trong 24h, Tỷ lệ thành công).
- Quản trị toàn bộ danh sách User.
- Quản lí Log hệ thống và nhận diện các giao dịch đáng ngờ (Fraud Logs).
- Khóa (Block) IP bằng cách đo lường lượt request / giao dịch thất bại.

---

## 🛡️ Best Practices Đã áp dụng

1. **Chuẩn hóa API Envelope Backend:** Tất cả Response từ Server đều bọc trong DTO `ApiResponse { success, data, message }`, bất kể là lỗi hay thành công, giúp Frontend cực kì dễ Un-wrap logic.
2. **Quản lý Phiên bản an toàn:** Giao dĩ API Auth không trả token bừa bãi. Frontend Next.js Route Handler hứng lấy JWT và nhét vào **HTTP-only Cookie**, trình duyệt hoàn toàn vô hình (Tránh tấn công XSS).
3. **Thanh toán an toàn:** Hoàn toàn không lưu mã thẻ tín dụng của khách vào database PostgreSQL. Hệ thống sử dụng cơ chế Tokenized của Stripe để đảm bảo tuân thủ tiêu chuẩn băng thông rộng PCI-DSS.

---