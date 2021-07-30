import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { BackendResolverService } from '../../services/backend-resolver.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  currentPassword = "";
  newPassword = "";
  repPassword = "";

  private backendAddress = "";

  constructor(private toastr: ToastrService, private http: HttpClient, private backendResolver: BackendResolverService) {
    this.backendAddress = backendResolver.getBackendUrl();
  }

  ngOnInit(): void {
  }

  changePassword() {

    if (this.newPassword.length == 0) {
      this.toastr.error("The field for the new password shouldn't be empty", 'Error');
      return;
    }

    if (this.newPassword != this.repPassword) {
      this.toastr.error("The repeated password doesn't match the new password", 'Error');
      return;
    }

    this.http.post(this.backendAddress + '/user/changePassword',
      {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      }
    ).subscribe(res => {
      let status = JSON.parse(JSON.stringify(res)).status;
      this.toastr.success(status, 'Success');
    }, err => {
      this.toastr.success(err.error.status, 'Success');
    })

  }

}
