import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { IUser } from '../../interfaces/IUser';
import { IEngine } from '../../interfaces/IEngine';
import { readAsText } from 'promise-file-reader';
import { Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { ISettings } from '../../interfaces/ISettings';
import { EngineService } from '../../services/engine.service';
import { ClipboardService } from 'ngx-clipboard';
import { BackendResolverService } from '../../services/backend-resolver.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  user: IUser = { fullName: '', username: '', password: '', role: 'user' };
  engines: IRegisteredEngine[] = [{ subscribedAs: '', cert: '', URI: '', listen: false, appIsActivated: false, appIsPending: false, appIsRejected: false, token:'' }];
  engineRegister: IEngine = { subscribedAs: '', cert: '', URI: '', listen: false, token:'' };
  activeEngine: IRegisteredEngine = { subscribedAs: '', cert: '', URI: '', listen: false, appIsActivated: false, appIsPending: false, appIsRejected: false, token:'' };
  settings: ISettings = {
    endpoints: {
      camunda: "",
      sme: "",
      ah: "",
    }
  }

  private backendAddress = "";

  constructor(
    private http: HttpClient, 
    private toastr: ToastrService, 
    private route: Router, 
    public settingsService: SettingsService, 
    public engineService: EngineService, 
    private clipboard: ClipboardService,
    private backendResolver: BackendResolverService) {
    this.settingsService.getSettings().then(settings => {
      this.settings = settings;
      this.reloadEngines();
      this.backendAddress = backendResolver.getBackendUrl();
    })
  }

  registerUser() {
    this.http.post(this.backendAddress + "/user/register", this.user).subscribe((res) => {
      let status = JSON.parse(JSON.stringify(res)).status;
      this.toastr.success(status, 'Success');
    },
      err => {
        this.toastr.error(err.error.details.body[0].message, 'Error');
      })
  }

  reloadEngines() {
    this.engines = [];
    this.activeEngine = { subscribedAs: '', cert: '', URI: '', listen: false, appIsActivated: false, appIsPending: false, appIsRejected: false, token:'' };
    this.engineService.getAll().then((registeredEngines: IEngine[]) => {
      registeredEngines.forEach(engine => {
        let registeredEngine: IRegisteredEngine = { subscribedAs: '', cert: '', URI: '', listen: false, appIsActivated: false, appIsPending: false, appIsRejected: false, token:'' };
        registeredEngine.URI = engine.URI;
        registeredEngine._id = engine._id;
        registeredEngine.cert = engine.cert;
        registeredEngine.listen = engine.listen;
        registeredEngine.subscribedAs = engine.subscribedAs;
        registeredEngine.token = engine.token;

        this.engineService.checkAppStatusIn(engine).then(appStatus => {
          registeredEngine.appIsActivated = appStatus.active;
          registeredEngine.appIsPending = appStatus.pending;
          registeredEngine.appIsRejected = appStatus.rejected;

          if (registeredEngine.listen) {
            this.activeEngine = registeredEngine;
          }

          this.engines.push(registeredEngine);
        })
      })
    })
  }

  async activateEngine(engine) {
    await this.engineService.activate(engine);
    this.reloadEngines();
  }

  async registerEngine() {
    console.log(this.engineRegister);
    let status = await this.engineService.register(this.engineRegister);
    if (status) {
      this.route.navigate(['/dashboard']);
    }
    this.reloadEngines();
  }

  async removeEngine(engine) {
    await this.engineService.remove(engine);
    this.reloadEngines();
  }

  async deactivateEngine(engine) {
    await this.engineService.deactivate(engine);
    this.reloadEngines();
  }

  readCert(e) {
    let certFile = e.target.files[0]
    readAsText(certFile)
      .then(data => {
        this.engineRegister.cert = data;
      })
      .catch(err => {
        this.toastr.error("Something went wrong when reading the file", 'Error');
      })
  }

  copyToClipboard(content: string) {
    this.clipboard.copy(content);
    this.toastr.info("Copied to clipboard", "Info");
  }
}

interface IRegisteredEngine extends IEngine {
  appIsActivated: boolean,
  appIsPending: boolean,
  appIsRejected: boolean,
}