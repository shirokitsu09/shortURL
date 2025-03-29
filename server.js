const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const urlController = require('./controllers/urlController');
require('./config/db');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ใช้ Body Parser ดึงข้อมูลจาก form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// // ใช้ Static files
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', urlController.getIndex);
app.post('/shorten', urlController.shortenUrl);
app.get('/history', urlController.history);
app.get('/:shortCode', urlController.redirectToFullUrl);
app.put('/update/:shortCode', urlController.updateUrl);
app.get('/view/:shortCode', urlController.viewUrlDetails);
app.post('/check-password/:shortCode', urlController.checkPassword);

app.listen(port, () => {
    console.log(`Server running at port:${port}`);
});
