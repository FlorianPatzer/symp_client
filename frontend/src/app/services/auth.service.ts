import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackendResolverService } from './backend-resolver.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  shouldHide = '';

  private backendAddress = "";

  constructor(private http: HttpClient, private backendResolver: BackendResolverService) {
    this.backendAddress = backendResolver.getBackendUrl();
  }

  public isAuthenticated(): Boolean {
    let userData = localStorage.getItem('userInfo')
    if (userData && JSON.parse(userData)) {
      return true;
    }
    return false;
  }

  public setUserInfo(user) {
    localStorage.setItem('userInfo', JSON.stringify(user));
  }

  public removeUserInfo() {
    localStorage.removeItem('userInfo')
  }

  public getUserInfo() {
    return JSON.parse(localStorage.getItem('userInfo'))
  }

  public validate(username, password) {
    return this.http.post(this.backendAddress + '/user/login', { 'username': username, 'password': password }).toPromise()
  }

  public isAdmin() {
    let usreRole = this.getUserInfo().role;
    if (usreRole == 'admin') {
      return true;
    }
    else {
      return false;
    }
  }

  public login(username, password) {
    return new Promise((resolve, reject) => {
      this.http.post(this.backendAddress + "/user/login", { username: username, password: password }).subscribe((res) => {
        let status = JSON.parse(JSON.stringify(res)).status;
        this.setUserInfo(res);
        resolve(status);
      }, err => {
        reject(err);
      });
    })
  }

  public register(username, password, fullName) {
    return new Promise((resolve, reject) => {
      this.http.post(this.backendAddress + "/user/register", { username: username, password: password, fullName: fullName })
        .subscribe((res) => {
          resolve(status)
          this.setUserInfo(res);
        }, err => {
          reject(err);
        });
    });
  }

  public logout() {
    return new Promise(resolve => {
      this.http.get(this.backendAddress + "/user/logout", {}).subscribe((res) => {
        this.removeUserInfo();
        resolve(res);
      })
    })
  }
}

