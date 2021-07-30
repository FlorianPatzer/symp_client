import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IAnalysis } from '../../interfaces/IAnalysis';
import { AnalysisService } from '../../services/analysis.service';

@Component({
  templateUrl: 'analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  constructor(private router: Router, private http: HttpClient, private toastr: ToastrService, private analysisService: AnalysisService) { }

  ngOnInit(): void {
    this.loadAnalyses();
  }

  view(analysis) {
    this.router.navigate(["/analysis/entry/" + analysis._id]);
  }

  analyses: IAnalysis[] = [];
  analysisStatus = [];
  ANALYSES_COLLECTION = [];

  pageSize = 10;
  analysisPage = 1;
  refreshAnalysisTable() {
    this.analyses = this.ANALYSES_COLLECTION
      .map((analysis, i) => ({ id: i + 1, ...analysis }))
      .slice((this.analysisPage - 1) * this.pageSize, (this.analysisPage - 1) * this.pageSize + this.pageSize);
  }

  loadAnalyses() {
    this.analysisService.getAllAnalysisData()
      .then((analsesData) => {
        this.ANALYSES_COLLECTION = analsesData;
        this.ANALYSES_COLLECTION.forEach(analysis => {
          this.analysisService.checkAnalysisStatus(analysis._id).then(res=>{
            this.analysisStatus.push(res.status);
          })
        });
        this.refreshAnalysisTable();
      })
  }

}

