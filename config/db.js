const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:1234@testsynerry.hdsi89a.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
