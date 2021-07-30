import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IEngine } from '../interfaces/IEngine';
import { BackendResolverService } from './backend-resolver.service';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  private backendAddress = "";

  constructor(private http: HttpClient, private toastr: ToastrService, private backendResolver: BackendResolverService) { 
    this.backendAddress = backendResolver.getBackendUrl();
  }

  register(engine: IEngine) {
    return new Promise((resolve)=>{
      this.http.post(this.backendAddress + '/engine/register', engine).subscribe((res) => {
        let status = JSON.parse(JSON.stringify(res)).status;
        this.toastr.info(status, 'Subscription request sent.');
        resolve(true);
      },
        err => {
          console.log(err)
          this.toastr.error(err.error.status, 'Error');
          resolve(false);
        })
    })
  }

  getAll() {
    return new Promise<IEngine[]>((resolve, reject) => {
      let engines = [];
      this.http.get(this.backendAddress + "/engine/").subscribe((registeredEngines: IEngine[]) => {
        resolve(registeredEngines);
      },
        err => {
          reject(null);
          this.toastr.error("Something went wrong in the backend", 'Error');
        })
    })
  }

  getActive() {
    return new Promise<IEngine>(resolve => {
      this.getAll().then(engines => {

        engines.forEach(eingine => {
          if (eingine.listen) {
            resolve(eingine)
          }
        })

        resolve(null);
      })
    })
  }

  checkAppStatusIn(engine) : Promise<IAppStatus> {
    return new Promise<IAppStatus>((resolve) => {
      this.http.get(this.backendAddress + "/engine/status/" + engine._id).subscribe((status: IAppStatus) => {
        resolve(status);
      },
        err => {
          resolve(null);
        })
    })
  }

  activate(engine: IEngine) {
    return new Promise((resolve, reject) => {
      this.http.post(this.backendAddress + '/engine/activate', engine).subscribe((res) => {
        let status = JSON.parse(JSON.stringify(res)).status;
        this.toastr.success(status, 'Success');
        resolve(true);
      },
        err => {
          console.log(err)
          this.toastr.error(err.error.status, 'Error');
          reject(false);
        })
    })
  }

  deactivate(engine: IEngine) {
    return new Promise((resolve, reject) => {
      this.http.post(this.backendAddress + '/engine/deactivate', engine).subscribe((res) => {
        let status = JSON.parse(JSON.stringify(res)).status;
        this.toastr.success(status, 'Success');
        resolve(true);
      },
        err => {
          console.log(err)
          this.toastr.error(err.error.status, 'Error');
          reject(false);
        })
    })
  }

  remove(engine: IEngine) {
    return new Promise((resolve, reject) => {
      this.http.request('delete', this.backendAddress + '/engine', { body: engine })
        .subscribe((res) => {
          let status = JSON.parse(JSON.stringify(res)).status;
          this.toastr.success(status, 'Success');
          resolve(true);
        },
          err => {
            console.log(err)
            this.toastr.error(err.error.status, 'Error');
            reject(false);
          })
    })
  }
}

interface IAppStatus {
  pending: boolean,
  active: boolean,
  rejected: boolean
}