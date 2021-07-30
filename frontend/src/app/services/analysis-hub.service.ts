import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IPolicy } from '../interfaces/IPolicy';
import { BackendResolverService } from './backend-resolver.service';

@Injectable({
  providedIn: 'root'
})
export class AnalysisHubService {

  private backendAddress = "";

  constructor(private http: HttpClient, private toastr: ToastrService, private backendResolver: BackendResolverService) { 
    this.backendAddress = backendResolver.getBackendUrl();
  }

  getPolicyData(policyUrl): Promise<IPolicy> {
    return new Promise<IPolicy>((resolve, reject) => {
      this.http.post(this.backendAddress + "/analysis/hub/policy/", { url: policyUrl }).subscribe((policyData: IPolicy) => {
        resolve(policyData);
      }, err => {
        this.toastr.error("Couldn't fetch policy data.");
        console.log(err);
        reject(null);
      })
    })
  }

  checkPolicyAvailability(policyUrl): Promise<Boolean> {
    return new Promise<Boolean>((resolve) => {
      this.http.post(this.backendAddress + "/analysis/hub/policy/", { url: policyUrl }).subscribe(res => { resolve(true) }, err => { resolve(false) });
    })
  }


}
