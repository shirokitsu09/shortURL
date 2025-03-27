const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    fullUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    clicks: { type: Number, default: 0 },
    qrcode: { type: String, required: true }  // QR Code URL
});

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;
