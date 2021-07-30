import { Component, OnInit } from '@angular/core';
import { navItems } from '../../_nav';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment'
import { SidebarItemsService } from '../../services/sidebar-items.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  public sidebarMinimized = false;
  public navItems = navItems;

  public user = '';
  public role = '';

  constructor(private authService: AuthService, private http: HttpClient, private router: Router, private toastr: ToastrService, public siderbarItemsService: SidebarItemsService) { }

  ngOnInit(): void {
    let userInfo = this.authService.getUserInfo();
    this.user = userInfo['fullName']

    if (userInfo['role'] == "admin") {
      this.role = "Administrator"
    }
    else if (userInfo['role'] == "engine") {
      this.role = "Analysis Engine"
    }
    else {
      this.role = "User"
    }
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

}
