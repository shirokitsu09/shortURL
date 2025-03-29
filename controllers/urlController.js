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
    const shortUrl = `${protocol}://${host}`;

    // สร้าง QR Code
    const qrcodeUrl = await generateQRCode(shortUrl + '/' + shortCode);

    // บันทึกข้อมูลในฐานข้อมูล
    const newUrl = new Url({ fullUrl, shortUrl, shortCode, qrcode: qrcodeUrl });
    await newUrl.save();

    res.render('result', { fullUrl, shortUrl, qrcodeUrl, shortCode });
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

// ฟังก์ชันแสดงประวัติการคลิกและสถิติ โดยกรอง protocol และ host ตรงกัน
exports.history = async (req, res) => {
    try {
        // กำหนดค่า protocol และ host ที่ต้องการให้ตรงกัน
        const protocol = req.protocol;  // ค่า http หรือ https
        const host = req.get('host');  // ค่า host ที่ใช้งานบนเซิร์ฟเวอร์

        // ดึงข้อมูลจากฐานข้อมูลและเรียงลำดับจากใหม่ไปเก่า
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
    const { newFullUrl } = req.body;  // รับค่า Full URL ใหม่จากผู้ใช้

    const updatedUrl = await Url.findOneAndUpdate(
        { shortCode },                  // ค้นหาด้วย shortCode
        { fullUrl: newFullUrl },        // อัพเดต Full URL
        { new: true }                   // คืนค่าข้อมูลที่ถูกอัพเดต
    );

    if (updatedUrl) {
        res.json({ message: 'URL updated successfully', success: true, updatedUrl });
    } else {
        res.status(404).send('Short URL not found');
    }
};




