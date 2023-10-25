import {Injectable} from '@angular/core';
import {User} from '../models/user/user.model';
import * as global from '../global.variables';
import 'rxjs';
import {UserService} from '../services/user.service';
import {HttpClient} from "@angular/common/http";
import {CoreService} from "./core.service";


@Injectable()
export class ConfigurationService {
  private base_url: string;
  private user: User;

  constructor(private http: HttpClient, private us: UserService, private coreService: CoreService){
    this.base_url = global.base_url;
    this.user = us.getCurrentUser();
  }

  getAllConfigurations(scope): any {
    const url = `${global.base_url}ConfigurationService/getConfigurationsForUpdate?appId=ECM&scope=${scope}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

   getAppConfigurationValue(keyName): any {
    const url = `${global.base_url}ConfigurationService/getConfiguration?appId=ECM&scope=APP&key=${keyName}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  updateConfigurationRow(val: any):any{
    const url = `${global.base_url}ConfigurationService/updateConfigurations?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, val,{responseType:'text'});
  }
}