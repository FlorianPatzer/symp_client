import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment'


@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html'
})
export class LoginComponent {
  constructor(private authService: AuthService, private http: HttpClient, private router: Router, private toastr: ToastrService) { }

  username = ""
  password = ""

  login() {
    this.authService.login(this.username, this.password)
      .then((status: string) => {
        this.toastr.success(status, 'Success',);
        this.router.navigate(['dashboard'])
      })
      .catch(err => {
        this.toastr.error(err.error.status, 'Error');
      })
  }

  navigateToRegister() {
    this.router.navigate(['register'])
  }
}
