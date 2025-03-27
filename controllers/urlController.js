const Url = require('../models/urlModel');
const QRCode = require('qrcode');

// ฟังก์ชันแสดงหน้าแรก
exports.getIndex = (req, res) => {
    res.render('index');
};

// ฟังก์ชันย่อ URL และสร้าง QR Code
exports.shortenUrl = async (req, res) => {
    const fullUrl = req.body.fullUrl;
    const shortCode = Math.random().toString(36).substr(2, 5);
    
    const protocol = req.protocol;
    const host = req.get('host');
    const shortUrl = `${protocol}://${host}/${shortCode}`;

    // สร้าง QR Code
    const qrcodeUrl = await generateQRCode(shortUrl);

    // บันทึกข้อมูลในฐานข้อมูล
    const newUrl = new Url({ fullUrl, shortUrl, shortCode, qrcode: qrcodeUrl });
    await newUrl.save();

    res.render('result', { fullUrl, shortUrl, qrcodeUrl });
};

// ฟังก์ชันสร้าง QR Code
async function generateQRCode(shortUrl) {
    try {
        return await QRCode.toDataURL(shortUrl);
    } catch (err) {
        console.error('Error generating QR code:', err);
    }
}

// ฟังก์ชันแสดงประวัติการคลิกและสถิติ
exports.history = async (req, res) => {
    const urls = await Url.find();
    res.render('history', { urls });
};

// ฟังก์ชันเพิ่มการคลิกใน Short URL
exports.incrementClick = async (req, res) => {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });

    if (url) {
        // เพิ่มจำนวนคลิก
        url.clicks += 1;
        await url.save();

        // Redirect ไปยัง URL ต้นทาง
        res.redirect(url.fullUrl);
    } else {
        res.status(404).send('Short URL not found');
    }
};

exports.redirectToFullUrl = async (req, res) => {
    const { shortCode } = req.params;

    // ค้นหา shortUrl ในฐานข้อมูล
    const url = await Url.findOne({ shortCode });

    if (url) {
        // เพิ่มจำนวนคลิก
        url.clicks += 1;
        await url.save();

        // Redirect ไปยัง URL ต้นทาง
        res.redirect(url.fullUrl);
    } else {
        // ถ้าไม่พบ shortUrl ในฐานข้อมูล ให้ redirect กลับไปที่หน้า index
        res.redirect('/');
    }
};

