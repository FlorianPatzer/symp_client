const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingsSchema = new Schema({
    endpoints: {
        camunda: String,
        sme: String,
        ah: String
    },
});

module.exports = mongoose.model('settings', settingsSchema);