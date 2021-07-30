export interface IAnalysisInSAE {
    uuid: string,
    name: string,
    description: string,
    currentAnalysisReport: object,
    currentApps: [],
    lastInvocation: string,
    lastFinish: string,
    analysisReports: [],
    policyAnalyses: [],
    targetSystem: number,
    runninng: boolean
}