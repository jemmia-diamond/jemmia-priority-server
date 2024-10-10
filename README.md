# README
## 502 BAD GATE WAY
1. Máy chủ DNS mã hóa cứng trong docker daemon.json

Biên tập/etc/docker/daemon.json

{
    "dns": ["10.1.2.3", "8.8.8.8"]
}
Khởi động lại trình nền docker để những thay đổi đó có hiệu lực:
sudo systemctl restart docker

Bây giờ khi bạn chạy/khởi động một vùng chứa, docker sẽ điền /etc/resolv.confcác giá trị từ daemon.json..