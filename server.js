const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const urlController = require('./controllers/urlController');
require('./config/db');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ใช้ Body Parser สำหรับดึงข้อมูลจาก form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ใช้ Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});
app.post('/shorten', urlController.shortenUrl);
app.get('/history', urlController.history);
app.get('/:shortCode', urlController.redirectToFullUrl);
app.put('/update/:shortCode', urlController.updateUrl);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
