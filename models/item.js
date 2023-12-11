const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    quantity: Number,
    category: String
});

module.exports = mongoose.model('item', itemSchema);
