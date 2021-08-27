import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { IAnalysis } from '../../../interfaces/IAnalysis';
import { IPolicy } from '../../../interfaces/IPolicy';
import { IReport } from '../../../interfaces/IReport';
import { ITragetSystem } from '../../../interfaces/ITragetSystem';
import { AnalysisHubService } from '../../../services/analysis-hub.service';
import { AnalysisService } from '../../../services/analysis.service';
import { SmeService } from '../../../services/sme.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent implements OnInit {

  analysis: IAnalysis = { id: null, name: '', description: '', template: 'test-template', targetSystemId: "", containedPolicies: [], engineURI: '' };
  targetSystem: ITragetSystem = { id: null, name: "", tasks: [], ontologyDependencies: [], ontologyPath: "" };
  ontoDependencies: IPolicy[] = [];

  constructor(private route: Router,
    private toastr: ToastrService,
    private activeRoute: ActivatedRoute,
    private smeService: SmeService,
    private modalService: NgbModal,
    private analysisService: AnalysisService,
    private hub: AnalysisHubService) {

    let analysisId = this.activeRoute.snapshot.paramMap.get('id');

    this.analysisService.getAnalysisData(analysisId).then(analysis => {
      this.analysis = analysis;
      this.smeService.getTargetSystemData(this.analysis.targetSystemId).then(ts => {
        this.targetSystem = ts;
      })

      analysis.containedPolicies.forEach(policy => {
        this.hub.getPolicyData(policy).then(policyData => {
          this.ontoDependencies.push(policyData);
        })
      })

      if (!this.analysis.id) {
        this.toastr.error("Analysis doesn't exist", "Error")
        this.route.navigate(['analysis'])
      }
    }).catch(err => {
      this.route.navigate(['analysis'])
    })
  }

  ngOnInit(): void {
  }

  run(loadingModal) {
    let modalRef = this.modalService.open(loadingModal);
    this.analysisService.startAnalysis(this.analysis.id)
      .then(res => {
        modalRef.close();
      }).catch(err => {
        modalRef.close();
      })
  }

  edit() {
    this.route.navigate(['analysis/setup/' + this.analysis.id])
  }

  delete() {
    this.analysisService.deleteAnalysis(this.analysis.id).then(res => {
      this.route.navigate(['/analysis'])
    })
  }

}

