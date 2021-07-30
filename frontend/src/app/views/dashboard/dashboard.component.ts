import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from '../../services/settings.service';
import { ISettings } from '../../interfaces/ISettings';
import { ClipboardService } from 'ngx-clipboard'
import { BackendResolverService } from '../../services/backend-resolver.service';

@Component({
  templateUrl: 'dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

  settings: ISettings;

  private backendAddress = "";

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private settingsService: SettingsService,
    private clipboard: ClipboardService,
    private backendResolver: BackendResolverService) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.backendAddress = backendResolver.getBackendUrl();
  }

  ngOnInit(): void {
    // TODO: Set interval to load data
    this.settingsService.getSettings().then(settings => {
      this.settings = settings;
      this.loadDefinitions();
      this.loadInstances();
    })
  }

  ngOnDestroy() {
    // TODO: Clear Intervals
  }

  doOperation = ""
  openConfirmationModal(content, doOperation, callback, params) {
    let modalRef = this.modalService.open(content);
    this.doOperation = doOperation;
    modalRef.result.then(decison => {
      if (decison) {
        callback(this, params)
      }
    })
  }

  loadDefinitions() {
    this.getDefinitions().then((res) => {
      this.DEFINITIONS_COLLECTION = res;
      this.refreshDefinitionsTable();
    })
  }


  loadInstances() {
    this.getInstances().then((res) => {
      this.INSTACES_COLLECTION = res.filter(({ state }) => state === 'ACTIVE' || state === 'SUSPENDED' || state === 'COMPLETED');
      this.active_instances = this.INSTACES_COLLECTION.filter(({ state }) => state === 'ACTIVE').length;
      this.suspended_instances = this.INSTACES_COLLECTION.filter(({ state }) => state === 'SUSPENDED').length;
      this.completed_instances = this.INSTACES_COLLECTION.filter(({ state }) => state === 'COMPLETED').length;
      this.refreshInstancesTable();
    })
  }


  definitions = [];
  DEFINITIONS_COLLECTION = [];
  getDefinitions() {
    return new Promise<[]>(resolve => {
      this.http.get(this.backendAddress + "/proxy/camunda/engine-rest/process-definition").subscribe((res) => {
        resolve(JSON.parse(JSON.stringify(res)))
      },
        (err) => {
          this.toastr.error("No access to Camunda", "Error");
        })
    })
  }

  instances = [];
  INSTACES_COLLECTION = [];
  active_instances = 0;
  suspended_instances = 0;
  completed_instances = 0;
  getInstances() {
    return new Promise<[]>(resolve => {
      this.http.get(this.backendAddress + "/proxy/camunda/engine-rest/history/process-instance").subscribe((res) => {
        resolve(JSON.parse(JSON.stringify(res)))
      })
    })
  }

  pageSize = 10;
  definitionsPage = 1;
  refreshDefinitionsTable() {
    this.definitions = this.DEFINITIONS_COLLECTION
      .map((definition, i) => ({ id: i + 1, ...definition }))
      .slice((this.definitionsPage - 1) * this.pageSize, (this.definitionsPage - 1) * this.pageSize + this.pageSize);
  }

  instancesPage = 1;
  refreshInstancesTable() {
    this.instances = this.INSTACES_COLLECTION
      .map((instance, i) => ({ id: i + 1, ...instance }))
      .slice((this.instancesPage - 1) * this.pageSize, (this.instancesPage - 1) * this.pageSize + this.pageSize);
  }

  startInstance(definitionId) {
    this.http.post(this.backendAddress + "/proxy/camunda/engine-rest/process-definition/" + definitionId + "/start", {}).subscribe(
      res => {
        this.toastr.success('Instance started', 'Success');
        this.loadInstances();
      },
      err => {
        this.toastr.error("No access to Camunda", 'Error');
      })
  }

  suspendInstance(instanceId, state) {
    this.http.put(this.backendAddress + "/proxy/camunda/engine-rest/process-instance/" + instanceId + "/suspended", { suspended: state }).subscribe(
      res => {
        if (state) {
          this.toastr.info('Instance suspended', 'Suspended');
        }
        else {
          this.toastr.info('Instance resumed', 'Resumed');
        }
        this.loadInstances();
      },
      err => {
        this.toastr.error(err.message, 'Error');
      })
  }

  deleteInstance(self, instanceId) {
    self.http.delete(this.backendAddress + "/proxy/camunda/engine-rest/process-instance/" + instanceId, {}).subscribe(
      res => {
        self.toastr.success('Instance deleted successfully', 'Deleted');
        self.loadInstances();
      },
      err => {
        console.log(err)
        self.toastr.error(err.message, 'Error');
      })
  }

  deleteDefinition(self, processId) {
    self.http.delete(this.backendAddress + "/proxy/camunda/engine-rest/deployment/" + processId, { params: { cascade: "true", } }).subscribe(
      res => {
        self.toastr.success('Deployment deleted successfully', 'Deleted');
        self.loadDefinitions();
        self.loadInstances();
      },
      err => {
        console.log(err)
        self.toastr.error(err.message, 'Error');
      })
  }

  copyToClipboard(content: string) {
    this.clipboard.copy(content);
    this.toastr.info("Copied to clipboard", "Info");
  }

}
