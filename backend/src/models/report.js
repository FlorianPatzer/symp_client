const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema({
    id: Number,
    analysisId: Number,
    engineURI: String,
    createdAt: Date,
    
});

module.exports = mongoose.model('reports', reportSchema);