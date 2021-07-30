import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-dashboard',
  templateUrl: 'register.component.html'
})
export class RegisterComponent {

  constructor(private authService: AuthService, private http: HttpClient, private router: Router, private toastr: ToastrService) { }

  fullName = "";
  username = "";
  password = "";
  confirmPasswrod = "";

  register() {
    if (this.password === this.confirmPasswrod) {
      this.authService.register(this.username, this.password, this.fullName)
        .then((status: string) => {
          this.toastr.success(status, 'Success');
          this.router.navigate(['dashboard'])
        })
        .catch(err => {
          this.toastr.error(err.error.status, 'Error');
        })
    }
    else {
      this.toastr.error("Passwords don't match", 'Error');
    }
  }
}

