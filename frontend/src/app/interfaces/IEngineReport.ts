export interface IEngineReport {
    id: Number,
    startTime: Date,
    finishTime: Date,
    analysisId: Number,
    error: Object,
    policyAnalysisReportSet: [Object]
}