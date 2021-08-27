import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IAnalysis } from '../../../interfaces/IAnalysis';
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

  reportId;
  constructor(public templates: TemplatesService, private activeRoute: ActivatedRoute, private router: Router, private toastr: ToastrService, private reportService: ReportService, private analysisService: AnalysisService) {
    this.reportId = this.activeRoute.snapshot.paramMap.get('id');
  }

  delete() {
    this.reportService.deleteLocal(this.reportId);
    this.router.navigate(['/reports/overview']);
  }

  templateChange() {
    //localStorage.setItem('template', JSON.stringify(this.templateKey));
    window.location.reload();
  }

}
