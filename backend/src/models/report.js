const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema({
    id: Number,
    engineURI: String,
    analysis: {
        uuid: String,
    },
    startTime: Date,
    finishTime: Date,
    policyAnalysisReportSet: [Object]
});

module.exports = mongoose.model('reports', reportSchema);