export interface IReport {
    _id: String,
    engineURI: String,
    analysis: {
        uuid: String,
    },
    startTime: Date,
    finishTime: Date,
    policyAnalysisReportSet: [
        {
            report: [Object],
            policyAnalysis: {
                name: String,
            }
        }
    ]
}