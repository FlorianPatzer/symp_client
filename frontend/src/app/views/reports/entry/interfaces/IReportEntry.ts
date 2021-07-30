import { Type } from "@angular/core";
import { IReport } from "../../../../interfaces/IReport";

export interface IReportEntry{
    data: IReport,
    templateComponent: Type<any>
}