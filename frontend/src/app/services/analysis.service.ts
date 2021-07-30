import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IAnalysis } from '../interfaces/IAnalysis';
import { IAnalysisInSAE } from '../interfaces/IAnalysisInSAE';
import { IBackendResponse } from '../interfaces/IBackendResponse';
import { BackendResolverService } from './backend-resolver.service';
import { EngineService } from './engine.service';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  private backendAddress = "";
  
  constructor(private http: HttpClient, private toastr: ToastrService, private engineService: EngineService, private backendResolver: BackendResolverService) { 
    this.backendAddress = backendResolver.getBackendUrl();
  }

  getAllAnalysisData(): Promise<IAnalysis[]> {
    return new Promise<IAnalysis[]>((resolve, reject) => {
      this.http.get(this.backendAddress + '/analysis').subscribe((analyses: IAnalysis[]) => {
        //Filter only the analyses for the current active engine
        this.engineService.getActive()
          .then(activeEngine => {
            let outputAnlyses = [];
            analyses.forEach(analysis => {
              if (analysis.engineURI == activeEngine.URI) {
                outputAnlyses.push(analysis);
              }
            });

            resolve(outputAnlyses);
          })
          .catch(err => {
            reject(null);
            this.toastr.warning("No active engine.", "Warning");
          })
      },
        (err) => {
          reject(null);
          this.toastr.error("No access to the backend.", "Error");
        })
    })
  }

  getAnalysisData(analysisId): Promise<IAnalysis> {
    return new Promise<IAnalysis>((resolve, reject) => {
      this.http.get(this.backendAddress + "/analysis/" + analysisId).subscribe((data: IAnalysis) => {
        resolve(data);
      },
        err => {
          reject(null);
          this.toastr.error("No access to the backend.", "Error");
        }
      )
    })
  }

  checkAnalysisStatus(analysisId):Promise<IBackendResponse> {
    return new Promise((resolve, reject) => {
      this.http.get(this.backendAddress + "/analysis/status/" + analysisId)
        .subscribe((res: IBackendResponse) => {
          resolve(res);
        }, err => {
          this.toastr.error(err.error.status, 'Error');
          resolve(null)
        });
    });
  }

  startAnalysis(analysisId): Promise<Boolean> {
    return new Promise<Boolean>((resolve) => {
      this.http.post(this.backendAddress + '/analysis/start/' + analysisId, {}).subscribe((res: IBackendResponse) => {
        this.toastr.success(res.status, 'Success');
        resolve(true);
      }, err => {
        this.toastr.error(err.error.status, 'Error');
        resolve(false);
      });
    });
  }

  createAnalysis(analysis: IAnalysis) {
    return new Promise<String>((resolve, reject) => {
      this.http.post(this.backendAddress + "/analysis", analysis).subscribe((res: IBackendResponse) => {
        this.toastr.success(res.status, "Success");
        resolve(res.analysisId)
      },
        err => {
          console.log(err.error.status);
          try {
            this.toastr.error(err.error.details.body[0].message, 'Error');
          }
          catch (e) {
            this.toastr.error(err.error.status, 'Error');
          }
          reject(null);
        })
    })
  }

  updateAnalysis(analysis: IAnalysis) {
    return new Promise<String>((resolve, reject) => {
      this.http.put(this.backendAddress + "/analysis", analysis).subscribe((res: IBackendResponse) => {
        this.toastr.success(status, "Success");
        resolve(res.analysisId)
      },
        err => {
          console.log(err.error.status);
          try {
            this.toastr.error(err.error.details.body[0].message, 'Error');
          }
          catch (e) {
            this.toastr.error(err.error.status, 'Error');
          }
          reject(null);
        })
    })
  }

  deleteAnalysis(analysisId): Promise<Boolean> {
    return new Promise<Boolean>((resolve, rejects) => {
      this.http.delete(this.backendAddress + "/analysis/" + analysisId).subscribe((res: IBackendResponse) => {
        resolve(true);
        this.toastr.success(res.status, 'Success');
      }, err => {
        rejects(false);
        this.toastr.error(err.error.status, 'Error');
      });
    });
  }

}