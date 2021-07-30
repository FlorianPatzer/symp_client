import { Injectable } from '@angular/core';
import { INavData } from '@coreui/angular';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { navItems } from '../_nav';

@Injectable({
  providedIn: 'root'
})
export class SidebarItemsService {
  constructor(private authService: AuthService) {
  }

  private generateItems(){
    let itemstToPresent: MyINavData[] = [];
    let user = this.authService.getUserInfo();

    navItems.forEach(item => {
      if(item.permissions){
        if(item.permissions.includes(user.role)){
          itemstToPresent.push(item);
        }
      }
      else{
        itemstToPresent.push(item);
      }
    });

    return itemstToPresent;
  }

  public getItems():Observable<MyINavData[]>{
    return of(this.generateItems())
  }
}

export interface MyINavData extends INavData {
  permissions?: string[];
}