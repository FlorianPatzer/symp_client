import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IBackendResponse } from '../interfaces/IBackendResponse';
import { IReport } from '../interfaces/IReport';
import { BackendResolverService } from './backend-resolver.service';
import { EngineService } from './engine.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private backendAddress = "";

  constructor(private http: HttpClient, private toastr: ToastrService, private engineService: EngineService, private backendResolver: BackendResolverService) { 
    this.backendAddress = backendResolver.getBackendUrl();
  }

  getAllReportsData(): Promise<IReport[]> {
    return new Promise<IReport[]>((resolve, reject) => {
      this.http.get(this.backendAddress + '/report').subscribe((reports: IReport[]) => {
        //Filter only the reports for the current active engine
        this.engineService.getActive()
          .then(activeEngine => {
            let outputReports = [];
            reports.forEach(report => {
              if (report.engineURI == activeEngine.URI) {
                outputReports.push(report);
              }
            });
            resolve(outputReports);
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

  getReportData(reportId): Promise<IReport> {
    return new Promise<IReport>((resolve, reject) => {
      this.http.get(this.backendAddress + "/report/" + reportId).subscribe((data: IReport) => {
        resolve(data);
      },
        err => {
          reject(null);
          this.toastr.error("No access to the backend.", "Error");
        }
      )
    })
  }

  deleteReport(reportId): Promise<Boolean> {
    return new Promise<Boolean>((resolve, rejects) => {
      this.http.delete(this.backendAddress + "/report/" + reportId).subscribe((res: IBackendResponse) => {
        resolve(true);
        this.toastr.success(res.status, 'Success');
      }, err => {
        rejects(false);
        this.toastr.error(err.error.status, 'Error');
      });
    });
  }

}
