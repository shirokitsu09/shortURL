const Url = require('../models/urlModel');
const QRCode = require('qrcode');
const dayjs = require('dayjs');

exports.getIndex = (req, res) => {
    res.render('index');
};

// ฟังก์ชันย่อ URL และสร้าง QR Code
exports.shortenUrl = async (req, res) => {
    const fullUrl = req.body.fullUrl;
    const expirationDate = req.body.expirationDate || null;
    const password = req.body.password || null;
    const accessLimit = req.body.accessLimit || null;

    if (!fullUrl) {
        return res.status(400).send('Full URL is required');
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const shortUrl = `${protocol}://${host}`;
    const shortCode = Math.random().toString(36).substr(2, 6);

    // สร้าง QR Code
    const qrcode = await generateQRCode(shortUrl + '/' + shortCode);

    // เตรียมข้อมูลที่จะบันทึก
    const newUrlData = {
        fullUrl,
        shortUrl,
        shortCode,
        qrcode,
        expirationDate,
        password,
        accessLimit
    };

    // บันทึกข้อมูลในฐานข้อมูล
    const newUrl = new Url(newUrlData);
    await newUrl.save();

    res.render('result', newUrlData);
};

// ฟังก์ชันสร้าง QR Code
async function generateQRCode(shortUrl) {
    try {
        return await QRCode.toDataURL(shortUrl);
    } catch (err) {
        console.error('Error generating QR code:', err);
    }
}

exports.redirectToFullUrl = async (req, res) => {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (url) {
        if (url.expirationDate !== null && new Date() > url.expirationDate) {
            return res.render('404');
        }

        if (url.accessLimit > 0 && url.clicks >= url.accessLimit) {
            return res.render('404');
        }

        // เพิ่มจำนวนคลิก
        url.clicks += 1;
        await url.save();

        if (url.password) {
            return res.render('password', { shortCode });  // แสดงฟอร์มให้กรอกรหัสผ่าน
        }

        res.redirect(url.fullUrl);
    } else {
        res.redirect('/');
    }
};

// ฟังก์ชันตรวจสอบรหัสผ่าน
exports.checkPassword = async (req, res) => {
    const { shortCode } = req.params;
    const { password } = req.body;

    const url = await Url.findOne({ shortCode });

    if (url) {
        if (url.password === password) {
            return res.json({ success: true, redirectUrl: url.fullUrl });
        } else {
            return res.json({ success: false, message: 'Incorrect password. Please try again.' });
        }
    } else {
        res.status(404).send('URL not found');
    }
};

// ฟังก์ชันแสดงประวัติการคลิกและสถิติ โดยกรอง protocol และ host ตรงกัน
exports.history = async (req, res) => {
    try {
        // กำหนดค่า protocol และ host ที่ต้องการให้ตรงกัน
        const protocol = req.protocol;
        const host = req.get('host');

        const urls = await Url.find({ shortUrl: `${protocol}://${host}` }).sort({ createdAt: -1 });
        // console.log(urls)

        res.render('history', { urls });
    } catch (err) {
        console.error('Error retrieving data', err);
        res.status(500).send('Error retrieving data');
    }
};

// ฟังก์ชันอัพเดต Full URL สำหรับ Dynamic QR Code
exports.updateUrl = async (req, res) => {
    const { shortCode } = req.params;
    const { newFullUrl } = req.body;

    const updatedUrl = await Url.findOneAndUpdate(
        { shortCode },         
        { fullUrl: newFullUrl },    
        { new: true }            
    );

    if (updatedUrl) {
        res.json({ message: 'URL updated successfully', success: true, updatedUrl });
    } else {
        res.status(404).send('Short URL not found');
    }
};

exports.viewUrlDetails = async (req, res) => {
    const { shortCode } = req.params;

    try {
        const url = await Url.findOne({ shortCode });

        if (!url) {
            return res.status(404).send({ success: false, message: 'URL not found' });
        }

        // แปลงวันที่
        if (url.expirationDate) {
            var expirationDate = dayjs(url.expirationDate).format('YYYY-MM-DD');
        }

        res.render('result', {
            fullUrl: url.fullUrl,
            shortUrl: url.shortUrl,
            shortCode: url.shortCode,
            qrcode: url.qrcode,
            expirationDate: expirationDate,
            clicks: url.clicks,
            password: url.password,
            accessLimit: url.accessLimit
        });
    } catch (err) {
        console.log('Error fetching URL details:', err);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
};


