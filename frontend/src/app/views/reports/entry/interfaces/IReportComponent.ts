import { IAnalysis } from "../../../../interfaces/IAnalysis";
import { IEngineReport } from "../../../../interfaces/IEngineReport";

export interface IReportComponent {
  reportData: IEngineReport;
  analysisData: IAnalysis;
}