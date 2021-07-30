import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  template: ''
})
export class LogoutComponent implements OnInit {

  constructor(private http: HttpClient, private toastr: ToastrService, private authService: AuthService, private router: Router) {
    this.authService.logout().then(res => {
      this.router.navigate(['/'])
    });
  }

  ngOnInit(): void {

  }

}
