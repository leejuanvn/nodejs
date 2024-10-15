const express = require('express');
const axios = require('axios'); // Thư viện để gửi yêu cầu HTTP
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let dataQueue = []; // Hàng đợi để lưu trữ dữ liệu
let isProcessing = false; // Biến để kiểm soát việc gửi dữ liệu

app.post('/webhook', (req, res) => {
    const receivedData = req.body;
    console.log('Webhook received:', receivedData);
    dataQueue.push(receivedData); // Thêm dữ liệu vào hàng đợi
    res.send({ status: 'Data received' });

    // Bắt đầu xử lý nếu chưa có quá trình nào đang diễn ra
    if (!isProcessing) {
        processQueue();
    }
});

// Hàm gửi dữ liệu đến Google Sheets
const sendDataToGoogleSheets = async (data) => {
    try {
        const response = await axios.post('https://script.google.com/macros/s/AKfycbweaVOX6Tkv9XKRCoGxhz2owEmEHf0lV26TrL1kBJfcrvNgy5hUvKohwfCNpra7RoC3TA/exec', data);
        console.log('Data sent to Google Sheets:', response.data);
    } catch (error) {
        console.error('Error sending data to Google Sheets:', error.message);
        throw new Error('Failed to send data to Google Sheets');
    }
};

// Hàm xử lý hàng đợi
const processQueue = async () => {
    if (dataQueue.length === 0) {
        isProcessing = false; // Đánh dấu đã hoàn thành
        return;
    }

    isProcessing = true; // Đánh dấu đang xử lý
    const dataToSend = dataQueue.shift(); // Lấy dữ liệu đầu tiên trong hàng đợi

    try {
        // Gửi dữ liệu đến Google Sheets
        await sendDataToGoogleSheets(dataToSend);
    } catch (error) {
        console.error('Failed to send data:', error.message);
    } finally {
        // Gọi lại hàm xử lý hàng đợi sau một khoảng thời gian
        setTimeout(processQueue, 1000); // Gửi yêu cầu tiếp theo sau 1 giây
    }
};

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app; // Xuất ứng dụng để Vercel có thể sử dụng
