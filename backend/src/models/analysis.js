const mongoose = require('mongoose');
const {Schema} = mongoose;

const analysisSchema = new Schema ({
    name: String,
    createdBy: String,
    createdAt: Date,
    description: String,
    targetSystemId: String,
    template: String,
    engineURI: String,
    id: Number,
    containedPolicies: [String]
});

module.exports = mongoose.model('analyses', analysisSchema);