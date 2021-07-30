import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild } from '@angular/core';
import { IReportEntry } from '../interfaces/IReportEntry';
import { TemplateDirective } from '../template.directive';
import { IReportComponent } from '../interfaces/IReportComponent';

@Component({
  selector: 'app-templated-view',
  templateUrl: './templated-view.component.html',
})
export class TemplatedViewComponent implements OnInit {
  @Input()
  report: IReportEntry

  @ViewChild(TemplateDirective, {static: true}) 
  templateHost: TemplateDirective

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.loadComponent();
  }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.report.templateComponent);

    const viewContainerRef = this.templateHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent<IReportComponent>(componentFactory);
    componentRef.instance.data = this.report.data
  }

}