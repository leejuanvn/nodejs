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
        console.error('Error sending data to Apps Script:', error.message);
        throw new Error('Failed to send data to Apps Script');
    }
};

// Hàm gửi dữ liệu đến client
const sendDataToClient = async () => {
    if (dataQueue.length === 0 || isSending) return; // Nếu không có dữ liệu hoặc đang gửi

    isSending = true; // Đánh dấu đang gửi

    // Gửi tối đa 5 yêu cầu mỗi giây (hoặc điều chỉnh theo nhu cầu)
    const maxRequestsPerSecond = 5;
    const requestsToSend = Math.min(maxRequestsPerSecond, dataQueue.length);

    for (let i = 0; i < requestsToSend; i++) {
        const dataToSend = dataQueue.shift(); // Lấy dữ liệu đầu tiên trong hàng đợi
        try {
            // Gửi dữ liệu đến Google Apps Script
            await sendDataToAppsScript(dataToSend);
        } catch (error) {
            console.error('Failed to send data:', error.message);
        }
    }

    isSending = false; // Đánh dấu đã gửi xong
};

// Bắt đầu gửi dữ liệu
setInterval(sendDataToClient, 1000); // Thực hiện kiểm tra hàng đợi mỗi giây

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app; // Xuất ứng dụng để Vercel có thể sử dụng
