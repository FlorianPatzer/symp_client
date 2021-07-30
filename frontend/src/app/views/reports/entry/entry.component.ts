import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AnalysisService } from '../../../services/analysis.service';
import { ReportService } from '../../../services/report.service';
import { TemplatesService } from '../../../services/templates.service';
import { IReportEntry } from './interfaces/IReportEntry';
import { EmptyComponent } from './templates/empty/empty.component';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent {

  templateName;
  templateKey;
  report: IReportEntry = { data: null, templateComponent: EmptyComponent };
  
  constructor(public templates: TemplatesService, private activeRoute: ActivatedRoute, private router: Router, private toastr: ToastrService ,private reportService: ReportService, private analysisService: AnalysisService) {
    let reportData = JSON.parse(localStorage.getItem('reportData'));
    let analysisData = JSON.parse(localStorage.getItem('analysisData'));
    let template = JSON.parse(localStorage.getItem('template'));

    this.templateKey = template;
    this.templateName = this.templates.loadNameOf(template);

    if (reportData) {
      this.report.data = reportData;
      this.report.templateComponent = this.templates.loadComponentOf(this.templateKey);
    }
    else {
      this.router.navigate(['/reports/overview']);
      this.toastr.error('Report data is missing','Error')
    }
  }

  delete(){
    this.reportService.deleteReport(this.report.data._id);
    this.router.navigate(['/reports/overview']);
  }

  templateChange(){
    localStorage.setItem('template', JSON.stringify(this.templateKey));
    window.location.reload();
  }

}
