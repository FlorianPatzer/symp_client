import { Component, Input, OnInit } from '@angular/core';
import { IReport } from '../../../../../interfaces/IReport';
import { IReportComponent } from '../../interfaces/IReportComponent';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit, IReportComponent {
  @Input()
  data: IReport;

  constructor() {

  }

  ngOnInit(): void {
    console.log("Test Template loaded");
    console.log(this.data);
  }

}
