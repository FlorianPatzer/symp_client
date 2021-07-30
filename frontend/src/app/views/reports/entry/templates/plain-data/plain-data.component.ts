import { Component, Input, OnInit } from '@angular/core';
import { IReport } from '../../../../../interfaces/IReport';

@Component({
  selector: 'app-plain-data',
  templateUrl: './plain-data.component.html',
  styleUrls: ['./plain-data.component.css']
})
export class PlainDataComponent implements OnInit {
  @Input()
  data: IReport;
  
  constructor() { }

  ngOnInit(): void {
    console.log("Plain Data Template loaded");
    console.log(this.data);
  }

}
