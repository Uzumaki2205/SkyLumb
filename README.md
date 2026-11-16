# Sky Height — Công Cụ Xem Chiều Cao Sky

Công cụ kiểm tra và tính toán chiều cao nhân vật dành cho người chơi tựa game ***Sky: Children of the Light*** (*Sky: Ánh Sáng Khi Đi Xa*).

> **Bảo mật tuyệt đối:** Toàn bộ quá trình quét mã và tính toán được thực hiện 100% trực tiếp trên trình duyệt của bạn (Client-side). Không có bất kỳ dữ liệu QR hay thông tin tài khoản nào bị tải lên hoặc lưu trữ trên máy chủ.

[**🌐 Mở công cụ trực tuyến**](https://uzumaki2205.github.io/SkyLumb/)

---

## ✨ Tính Năng Nổi Bật

- 📏 **Đo chiều cao chính xác:** Tính toán chỉ số chiều cao hiện tại, giới hạn chiều cao tối đa và tối thiểu có thể đạt được.
- 📷 **Quét mã QR trực tiếp bằng Camera:** Tích hợp camera quét mã QR thời gian thực với khung ngắm và tia quét laser, tự động nhận diện và tính toán.
- 🖼️ **Tải ảnh chụp màn hình QR:** Kéo thả hoặc chọn ảnh chụp màn hình mã QR trang phục từ thiết bị.
- 📱 **Giao diện phong cách Mobile App:** Thiết kế tối ưu cho điện thoại với thanh điều hướng (Bottom Navigation Bar) cố định, chuyển đổi giữa các tab mượt mà.
- 🎨 **Tùy chỉnh & Tạo ảnh chia sẻ:** Chọn các hình nền phong cảnh Sky, dải màu gradient hoặc tự tải ảnh cá nhân để tạo thẻ kết quả và tải về máy.
- ⏱️ **Lịch sử đo thông minh:** Lưu trữ các lần đo trước đó, tự động lọc trùng lặp, cập nhật ngày giờ và cho phép viết ghi chú riêng.
- 🌓 **Hỗ trợ Giao diện Sáng / Tối (Dark & Light Mode).**
- 🌐 **Đa ngôn ngữ:** Tiếng Việt (mặc định), English, 繁體中文, 日本語.

---

## 📖 Hướng Dẫn Sử Dụng

### Bước 1: Lấy mã QR trang phục trong game
1. Mở game ***Sky: Children of the Light***.
2. Vào **Cài đặt** (biểu tượng bánh răng) > **Tài khoản** > **Thông tin tài khoản** > **Mã QR trang phục** (*Outfit QR Code*).
3. **Chụp ảnh màn hình** chứa mã QR này *(Lưu ý: Đây KHÔNG phải là mã QR kết bạn)*.

### Bước 2: Kiểm tra chiều cao bằng công cụ
Bạn có thể chọn một trong các cách sau:
- **Cách 1 — Quét trực tiếp bằng Camera:** Bấm nút **"Quét bằng Camera"** và đưa mã QR vào khung ngắm để công cụ tự động đọc.
- **Cách 2 — Tải ảnh chụp màn hình:** Bấm nút **"Chọn ảnh QR"** hoặc kéo thả ảnh chụp màn hình vào ô tải lên.
- **Cách 3 — Dán đường link:** Dùng ứng dụng quét mã để đọc ảnh chụp, sau đó sao chép toàn bộ đường link bắt đầu bằng `https://sky.thatg.co/o=` và dán vào ô nhập liệu rồi bấm **Bắt đầu tính toán**.

---

## 🛠️ Công Nghệ Sử Dụng

- **HTML5 & CSS3** (CSS Variables, Flexbox, Grid, Backdrop-filter Glassmorphism)
- **Vanilla JavaScript (ES6+)**
- **[jsQR](https://github.com/cozmo/jsQR)**: Thư viện đọc và giải mã QR Code chạy trên client-side
- **Web MediaDevices API**: Luồng camera thời gian thực trên trình duyệt

---

## 📄 Bản Quyền & Giấy Phép

Dự án này là mã nguồn mở và được phát hành theo giấy phép [MIT License](LICENSE).  
Công cụ được phát triển độc lập cho cộng đồng game thủ Sky và không liên kết chính thức với thatgamecompany.
