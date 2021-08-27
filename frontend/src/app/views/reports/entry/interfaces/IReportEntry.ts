import { Type } from "@angular/core";
import { IEngineReport } from "../../../../interfaces/IEngineReport";
import { IReport } from "../../../../interfaces/IReport";

export interface IReportEntry{
    data: IEngineReport,
    templateComponent: Type<any>
}