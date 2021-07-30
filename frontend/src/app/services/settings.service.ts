import { Injectable } from '@angular/core';
import { ISettings } from '../interfaces/ISettings';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { BackendResolverService } from './backend-resolver.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private backendAddress = "";

  constructor(private http: HttpClient, private toastr: ToastrService, private backendResolver: BackendResolverService) { 
    this.backendAddress = backendResolver.getBackendUrl();
  }

  getSettings() {
    return new Promise<ISettings>(resolve => {
      this.http.get(this.backendAddress + "/settings")
        .subscribe((settings: ISettings) => {
          resolve(settings)
        },
        err=>{
          this.toastr.error("Can't get client settings from the backend","Error")
        })
    })
  }

  updateSettings(settings: ISettings) {
    return new Promise((resolve, reject) => {
      this.http.post(this.backendAddress + "/settings", settings)
        .subscribe(
          data => {
            this.toastr.success("Settings updated", "Success");
            resolve(true)
          },
          err => {
            this.toastr.error("Update failed", "Error");
            reject();
          })
    })
  }

}
