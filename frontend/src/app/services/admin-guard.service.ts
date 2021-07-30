import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivate{

  constructor(private authService : AuthService, private route : Router, private toastr: ToastrService) { }

  canActivate(){
    if(this.authService.isAdmin()){
      return true;
    }

    this.toastr.error("You have no admin rights.","Unauthorized")
    this.route.navigate(['dashboard']);
    return false;
  }
}
