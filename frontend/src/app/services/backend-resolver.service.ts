import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendResolverService {

  constructor() { }

  getBackendUrl():string{
    let backendAddress = "";

    // Check if running on production
    if(environment.production){

      // Check which is the current hostname
      let hostname = window.location.hostname;

      // Check if user is accessing the service over localhost
      if(hostname.includes("localhost")){
        // Rewrite the url
        backendAddress = "/client" + environment.endpoints.backend;
      }
      // If the hostname is any other, just use the default
      else{
        backendAddress = environment.endpoints.backend
      }
    }
    // If app is started in dev mode, just use the default 
    else{
      backendAddress = environment.endpoints.backend
    }

    return backendAddress;
  }
}
