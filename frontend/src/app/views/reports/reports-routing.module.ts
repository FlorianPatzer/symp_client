import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from '../reports/entry/entry.component';
import { ReportsComponent } from './reports.component';

const routes: Routes = [{
  path: '',
  data: {
    title: 'Reports'
  },
  children: [
    {
      path: '',
      redirectTo: 'overview'
    },
    {
      path: 'overview',
      component: ReportsComponent,
      data: {
        title: 'Overview'
      }
    },
    {
      path: 'entry/:id',
      component: EntryComponent,
      data: {
        title: 'Entry'
      }
    }
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
