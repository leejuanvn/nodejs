const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json()); // Để có thể nhận dữ liệu JSON

// Mảng để lưu trữ yêu cầu
const requestQueue = [];
let isProcessing = false;

// Hàm gửi yêu cầu
async function sendRequest(request) {
    try {
        const response = await axios.post('https://script.google.com/macros/s/AKfycbweaVOX6Tkv9XKRCoGxhz2owEmEHf0lV26TrL1kBJfcrvNgy5hUvKohwfCNpra7RoC3TA/exec', { data: request });
        console.log(`Gửi: ${request}, Nhận: ${response.data}`);
    } catch (error) {
        console.error(`Lỗi khi gửi yêu cầu: ${request}`, error.message);
    }
}

// Hàm xử lý hàng đợi
async function processQueue() {
    if (isProcessing) return; // Nếu đang xử lý thì không làm gì thêm
    isProcessing = true;

    while (requestQueue.length > 0) {
        const request = requestQueue.shift(); // Lấy yêu cầu đầu tiên trong hàng đợi
        await sendRequest(request);
        await new Promise(resolve => setTimeout(resolve, 500)); // Chờ 500ms trước khi gửi yêu cầu tiếp theo
    }

    isProcessing = false; // Kết thúc quá trình xử lý
}

// Định nghĩa endpoint nhận yêu cầu
app.post('/webhook', (req, res) => {
    const request = req.body; // Nhận yêu cầu từ body
    requestQueue.push(request); // Thêm yêu cầu vào hàng đợi
    res.status(200).send(`Yêu cầu đã được thêm vào hàng đợi.`);
    processQueue(); // Bắt đầu xử lý hàng đợi nếu chưa có quá trình nào đang chạy
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
