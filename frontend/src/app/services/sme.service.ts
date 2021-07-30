import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ISettings } from '../interfaces/ISettings';
import { ITragetSystem } from '../interfaces/ITragetSystem';
import { BackendResolverService } from './backend-resolver.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class SmeService {

  private settings: ISettings;
  private backendAddress = "";

  constructor(private settingsService: SettingsService, private http: HttpClient, private toastr: ToastrService, private backendResolver: BackendResolverService) {
    this.settingsService.getSettings().then(settings => {
      this.settings = settings;
    });

    this.backendAddress = backendResolver.getBackendUrl();
  }

  getTargetSystemData(id): Promise<ITragetSystem> {
    return new Promise<ITragetSystem>((resolve, reject) => {
      this.http.get(this.backendAddress + "/proxy/sme/api/targetsystem/" + id).subscribe((ts: ITragetSystem) => {
        resolve(ts)
      }, err => {
        reject(null);
      })
    })
  }

  getAllTargetSystems(): Promise<ITragetSystem[]> {
    return new Promise<ITragetSystem[]>((resolve, reject) => {
      this.http.get(this.backendAddress + "/proxy/sme/api/targetsystem").subscribe((targetSystems: ITragetSystem[]) => {
        resolve(targetSystems)
      }, err => {
        this.toastr.error("Can't get target systems. SME is not responding.", "Error");
        reject([]);
      })
    })
  }

}
