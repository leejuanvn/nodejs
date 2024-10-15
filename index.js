const express = require('express');
const axios = require('axios'); // Thư viện để gửi yêu cầu HTTP
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let dataQueue = []; // Mảng để lưu trữ dữ liệu nhận được
let isSending = false; // Biến để kiểm soát việc gửi dữ liệu

// Endpoint nhận JSON từ webhook
app.post('/webhook', (req, res) => {
    const receivedData = req.body;
    console.log('Webhook received:', receivedData);
    dataQueue.push(receivedData); // Thêm dữ liệu vào hàng đợi
    res.send({ status: 'Data received' });
});

// Hàm gửi dữ liệu đến Google Apps Script
const sendDataToAppsScript = async (data) => {
    try {
        const response = await axios.post('https://script.google.com/macros/s/AKfycbweaVOX6Tkv9XKRCoGxhz2owEmEHf0lV26TrL1kBJfcrvNgy5hUvKohwfCNpra7RoC3TA/exec', data);
        console.log('Data sent to Apps Script:', response.data);
    } catch (error) {
        console.error('Error sending data to Apps Script:', error);
    }
};

// Hàm gửi dữ liệu đến client
const sendDataToClient = async () => {
    if (dataQueue.length === 0 || isSending) return; // Nếu không có dữ liệu hoặc đang gửi

    isSending = true; // Đánh dấu đang gửi
    const dataToSend = dataQueue.shift(); // Lấy dữ liệu đầu tiên trong hàng đợi

    // Gửi dữ liệu đến Google Apps Script
    await sendDataToAppsScript(dataToSend);

    setTimeout(() => {
        isSending = false; // Đánh dấu đã gửi xong
        sendDataToClient(); // Gọi lại hàm để gửi dữ liệu tiếp theo
    }, 500); // Gửi mỗi nửa giây
};

// Bắt đầu gửi dữ liệu
setInterval(sendDataToClient, 500); // Thực hiện kiểm tra hàng đợi mỗi nửa giây

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app; // Xuất ứng dụng để Vercel có thể sử dụng
