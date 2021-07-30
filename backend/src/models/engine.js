const mongoose = require('mongoose');
const {Schema} = mongoose;

const engineSchema = new Schema ({
    subscribedAs: String,
    URI: String,
    token: String,
    cert: String,
    listen: Boolean,
    uuid: String
});

module.exports = mongoose.model('engines', engineSchema);