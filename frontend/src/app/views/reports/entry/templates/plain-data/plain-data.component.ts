import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAnalysis } from '../../../../../interfaces/IAnalysis';
import { IEngineReport } from '../../../../../interfaces/IEngineReport';
import { IReport } from '../../../../../interfaces/IReport';
import { ReportService } from '../../../../../services/report.service';
import { IReportComponent } from '../../interfaces/IReportComponent';

@Component({
  selector: 'app-plain-data',
  templateUrl: './plain-data.component.html',
  styleUrls: ['./plain-data.component.css']
})
export class PlainDataComponent implements OnInit, IReportComponent {
  @Input() 
  reportData: IEngineReport;
  analysisData: IAnalysis;

  constructor() {}

  ngOnInit(): void {
    console.log("Plain Data Template loaded");
    console.log(this.reportData);
  }

}
