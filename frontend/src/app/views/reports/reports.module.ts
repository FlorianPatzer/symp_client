import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { EntryComponent } from './entry/entry.component';
import { TemplatedViewComponent } from './entry/templated-view/templated-view.component';
import { TemplateDirective } from './entry/template.directive';
import { TestComponent } from './entry/templates/test/test.component';
import { EmptyComponent } from './entry/templates/empty/empty.component';
import { PlainDataComponent } from './entry/templates/plain-data/plain-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [ReportsComponent, EntryComponent, TemplatedViewComponent, TemplateDirective, TestComponent, EmptyComponent, PlainDataComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    NgbPaginationModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [TestComponent, EmptyComponent, PlainDataComponent]
})
export class ReportsModule { }
