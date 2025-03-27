const express = require('express');
const bodyParser = require('body-parser');
const urlController = require('./controllers/urlController');
require('./config/db');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// ใช้ Body Parser สำหรับดึงข้อมูลจาก form
app.use(bodyParser.urlencoded({ extended: true }));

// ใช้ Static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});
app.post('/shorten', urlController.shortenUrl);
app.get('/history', urlController.history);
app.get('/:shortCode', urlController.redirectToFullUrl);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
