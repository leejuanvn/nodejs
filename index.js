const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để nhận JSON
app.use(express.json());

// Endpoint gốc
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js API! Use /receive-json to send JSON data.');
});

// Endpoint nhận JSON
app.post('/receive-json', (req, res) => {
    const receivedData = req.body;
    console.log('Received JSON:', receivedData);

    const sendData = { message: 'Data received', data: receivedData };

    setInterval(() => {
        axios.post('https://script.google.com/macros/s/AKfycbweaVOX6Tkv9XKRCoGxhz2owEmEHf0lV26TrL1kBJfcrvNgy5hUvKohwfCNpra7RoC3TA/exec', sendData)
            .then(response => {
                console.log('Sent JSON to Apps Script:', sendData);
            })
            .catch(error => {
                console.error('Error sending JSON:', error);
            });
    }, 1000);

    res.send({ status: 'Data received, will send to Apps Script every second' });
});

// Bắt đầu server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
