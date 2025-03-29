const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    fullUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    qrcode: { type: String, required: true },
    expirationDate: { type: Date, default: null },
    password: { type: String, default: null },
    accessLimit: { type: Number, default: null },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Url', urlSchema);
