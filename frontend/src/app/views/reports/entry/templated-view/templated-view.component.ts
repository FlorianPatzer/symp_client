import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild } from '@angular/core';
import { IReportEntry } from '../interfaces/IReportEntry';
import { TemplateDirective } from '../template.directive';
import { IReportComponent } from '../interfaces/IReportComponent';
import { ReportService } from '../../../../services/report.service';
import { AnalysisService } from '../../../../services/analysis.service';
import { TemplatesService } from '../../../../services/templates.service';

@Component({
  selector: 'app-templated-view',
  templateUrl: './templated-view.component.html',
})
export class TemplatedViewComponent implements OnInit {
  @Input()
  reportId;

  @ViewChild(TemplateDirective, { static: true })
  templateHost: TemplateDirective

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private reportService: ReportService, private analysisService: AnalysisService, private templateService: TemplatesService) { }

  ngOnInit(): void {
    this.loadComponent();
  }

  loadComponent() {
    this.reportService.getFromEngine(this.reportId).then(report => {
      this.analysisService.getAnalysisData(report.analysisId).then(analysis => {
        let templateComponent = this.templateService.loadComponentOf(analysis.template);
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory<IReportComponent>(templateComponent);

        const viewContainerRef = this.templateHost.viewContainerRef;
        viewContainerRef.clear();

        const componentRef = viewContainerRef.createComponent<IReportComponent>(componentFactory);
        componentRef.instance.reportData = report;
        componentRef.instance.analysisData = analysis;
      })

    })
  }

}