import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnalysisComponent } from './analysis.component';
import { SetupComponent } from './setup/setup.component'
import { EntryComponent } from './entry/entry.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Anlysis'
    },
    children: [
      {
        path: '',
        redirectTo: 'overview'
      },
      {
        path: 'overview',
        component: AnalysisComponent, // another child route component that the router renders
        data: {
          title: 'Overview'
        }
      },
      {
        path: 'setup/:id',
        component: SetupComponent,
        data: {
          title: 'Update'
        }
      },
      {
        path: 'setup',
        component: SetupComponent,
        data: {
          title: 'Create'
        }
      },
      {
        path: 'entry',
        redirectTo: 'overview'
      },
      {
        path: 'entry/:id',
        component: EntryComponent,
        data: {
          title: 'Entry'
        }
      }]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestbedRoutingModule { }
