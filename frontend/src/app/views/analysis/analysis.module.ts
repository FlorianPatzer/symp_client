import { NgModule, Pipe } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

import { AnalysisComponent } from './analysis.component';
import { TestbedRoutingModule } from './analysis-routing.module';
import { CommonModule } from '@angular/common';
import { SetupComponent } from './setup/setup.component';
import { EntryComponent } from './entry/entry.component';

// Collapse Component
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    FormsModule,
    TestbedRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    CommonModule,
    CollapseModule.forRoot(),
    NgbPaginationModule,
  ],
  declarations: [AnalysisComponent, SetupComponent, EntryComponent],
})
export class AnalysisModule { }
