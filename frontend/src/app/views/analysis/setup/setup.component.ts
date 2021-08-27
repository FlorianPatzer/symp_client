import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplatesService } from '../../../services/templates.service';
import { ITemplate } from '../../../interfaces/ITemplate';
import { IAnalysis } from '../../../interfaces/IAnalysis';
import { ITragetSystem } from '../../../interfaces/ITragetSystem';
import { SettingsService } from '../../../services/settings.service';
import { ISettings } from '../../../interfaces/ISettings';
import { EngineService } from '../../../services/engine.service';
import { SmeService } from '../../../services/sme.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnalysisService } from '../../../services/analysis.service';
import { AnalysisHubService } from '../../../services/analysis-hub.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent {
  @ViewChild('subscriptionModalTemplate', { static: true }) subscriptionModalTemplate: ElementRef;

  operation = '';
  modalRef: BsModalRef;
  analysis: IAnalysis = { name: '', description: '', template: 'test-template', targetSystemId: "", containedPolicies: [], engineURI: "" };
  policyAvailability = [];
  templates: ITemplate[];
  targetSystems: ITragetSystem[] = [];
  settings: ISettings;
  policyUrls = [];

  constructor(
    private modalService: NgbModal,
    private bsModalService: BsModalService,
    private route: Router,
    private toastr: ToastrService,
    private activeRoute: ActivatedRoute,
    public templateService: TemplatesService,
    private settingsService: SettingsService,
    private engineService: EngineService,
    private smeService: SmeService,
    private analysisService: AnalysisService,
    public hub: AnalysisHubService
  ) {

    this.settingsService.getSettings().then(async settings => {
      this.settings = settings;
      let analysisId = this.activeRoute.snapshot.paramMap.get('id');

      this.templates = templateService.getAllTemplatesData();

      this.smeService.getAllTargetSystems().then(ts => {
        this.targetSystems = ts;
        if (!analysisId) {
          this.analysis.targetSystemId = this.targetSystems[0].id.toString();
        }
      })

      if (analysisId != null) {
        this.operation = "Update"
        this.analysisService.getAnalysisData(analysisId).then(analysis => {
          this.analysis = analysis;
          this.analysis.containedPolicies.forEach(policy => {
            this.hub.checkPolicyAvailability(policy).then(status => {
              this.policyAvailability.push(status);
            })
          })
        })
      }
      else {
        this.operation = "Create"
        this.engineService.getActive().then(engine => {
          this.analysis.engineURI = engine.URI;
        })
      }
    })
  }

  addEntry() {
    this.analysis.containedPolicies.push('');
    this.policyUrls.push('');
    this.policyAvailability.push(false);
  }

  removeEntry(i) {
    this.analysis.containedPolicies.splice(i, 1);
    this.policyUrls.splice(i, 1);
    this.policyAvailability.splice(i, 1);
  }

  checkEntry(i) {
    this.hub.getPolicyData(this.policyUrls[i])
      .then(policyData => {
        this.policyAvailability[i] = true;
        this.analysis.containedPolicies[i] = policyData.policyUrl;
      })
      .catch(err => {
        this.policyAvailability[i] = false;
        this.analysis.containedPolicies[i] = "";
      })
  }

  existingAnalysisId;
  doOperation(loadingModal) {
    let loadingModalRef = this.modalService.open(loadingModal);

    if (this.analysis.id) {
      this.analysisService.updateAnalysis(this.analysis).then(analysisId => {
        loadingModalRef.close();
        this.route.navigate(['analysis/entry/' + analysisId]);
      }).catch(err => {
        loadingModalRef.close();
      })
    }
    else {
      this.analysisService.createAnalysis(this.analysis).then(analysisId => {
        loadingModalRef.close();
        this.route.navigate(['analysis/entry/' + analysisId]);
      }).catch(errData => {
        loadingModalRef.close();
        if (errData != null && errData != undefined) {
          // TODO: Remove log
          console.log("Opening modal");
          this.existingAnalysisId = errData;
          this.modalRef = this.bsModalService.show(this.subscriptionModalTemplate, { class: 'modal-sm modal-dialog-centered' });
        }
        else {
          // TODO: Remove log
          console.log("Skip opening modal")
        }
      })
    }
  }

  openModal(modalTemplate: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(modalTemplate, { class: 'modal-sm modal-dialog-centered' });
  }

  cancelCreation(self) {
    self.toastr.info("The operation was canceled.", "Info");
    self.route.navigate(['analysis/overview']);
  }

  subscribeToAnalysis(self) {
    self.analysisService.subscribe(self.existingAnalysisId).then(analysisId => {
      self.route.navigate(['analysis/entry/' + analysisId]);
    })
  }

  confirm(callback, self): void {
    if (typeof callback === 'function') {
      callback(self);
    }
    this.modalRef.hide();
  }

  decline(callback): void {
    if (typeof callback === 'function') {
      callback(self);
    }
    this.modalRef.hide();
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

}