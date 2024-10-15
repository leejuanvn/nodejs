const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Node.js API! Use /receive-json to send JSON data.');
});

app.post('/receive-json', (req, res) => {
    const receivedData = req.body;
    console.log('Received JSON:', receivedData);
    res.send({ status: 'Data received', data: receivedData });
});

// Chỉ cần lắng nghe nếu chạy cục bộ, không cần cho Vercel
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;  // Xuất ứng dụng để Vercel có thể sử dụng
