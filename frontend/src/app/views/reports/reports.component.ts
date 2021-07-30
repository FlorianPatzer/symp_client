import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IReport } from '../../interfaces/IReport';
import { Router } from '@angular/router';
import { AnalysisService } from '../../services/analysis.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router, private analysisService: AnalysisService, private reportService: ReportService) { }

  ngOnInit(): void {
    this.loadReports()
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
    this.reportService.getAllReportsData().then((reports) => {
      this.REPORTS_COLLECTION = reports;
      this.refreshReportsTable();
    })
  }

  async viewEntry(report: IReport) {
    //TODO: Implement viewing as a modal and remove the saving in local storage, instead pass data directly to the template
    let analysisData = await this.analysisService.getAnalysisData(report.analysis.uuid);
    localStorage.setItem('analysisData', JSON.stringify(analysisData));
    localStorage.setItem('template', JSON.stringify(analysisData.template));
    localStorage.setItem('reportData', JSON.stringify(report));
    this.router.navigate(["/reports/entry/" + report._id]);
  }

}
