import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IReport } from '../../interfaces/IReport';
import { Router } from '@angular/router';
import { AnalysisService } from '../../services/analysis.service';
import { ReportService } from '../../services/report.service';
import { IEngineReport } from '../../interfaces/IEngineReport';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  constructor(private router: Router, public reportService: ReportService) { }

  interval;
  msBetweenCheck = 3000;
  
  ngOnInit(): void {
    this.loadReports()
    this.interval = setInterval(() => {
      this.loadReports()
    }, this.msBetweenCheck)
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
  
  reports: IReport[];
  REPORTS_COLLECTION = [];

  pageSize = 10;
  reportPage = 1;
  refreshReportsTable() {
    this.reports = this.REPORTS_COLLECTION
      .map((report, i) => ({ id: i + 1, ...report }))
      .slice((this.reportPage - 1) * this.pageSize, (this.reportPage - 1) * this.pageSize + this.pageSize);
  }

  loadReports() {
    this.reportService.getAllLocal().then((reports) => {
      this.REPORTS_COLLECTION = reports;
      this.refreshReportsTable();
    })
  }

  async viewEntry(report: IReport) {
    this.router.navigate(["/reports/entry/" + report.id]);
  }

}
