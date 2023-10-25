import {Injectable} from '@angular/core';
import {Output, EventEmitter} from '@angular/core';
import {User} from '../models/user/user.model';
import * as global from '../global.variables';
import 'rxjs';
import {UserService} from '../services/user.service';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CoreService} from "./core.service";

@Injectable()
export class AccessPolicyService {
  private base_url: string;
  private user: User;

  constructor(private http: HttpClient, private us: UserService, private coreService: CoreService){
    this.base_url = global.base_url;
    this.user = us.getCurrentUser();
  }
  getAccessPoliciesByGrantee(username,type,level){
    const url = `${global.base_url}AccessPolicyService/getAccessPoliciesByGrantee?granteeName=${username}&sType=${''}&aType=${type}&aLevel=${level}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getAccessPolicyPermissions(id: any, objType: any):any{
    const url = `${global.base_url}AccessPolicyService/getAccessPolicyPermissions?objId=${id}&objType=${objType}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getAccessPolicies(empno): any {
    const url = `${global.base_url}AccessPolicyService/getAllAccessPolicies?empNo=${empno}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getAllAccessPolicies(): any {
    const url = `${global.base_url}AccessPolicyService/getAllAccessPolicies?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  addAccessPolicy(jsonstring: any):any{
    if(jsonstring._$visited){
      delete jsonstring._$visited;
    }
    const url = `${global.base_url}AccessPolicyService/addAccessPolicy?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, jsonstring,{responseType:'text'});
  }

  setPermissions(jsonstring: any):any{
    if(jsonstring._$visited){
      delete jsonstring._$visited;
    }
    const url = `${global.base_url}AccessPolicyService/setAccessPolicyPermissions?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, jsonstring,{responseType:'text'});
  }

  getAccessPoliciesByOrgId(orgId):any{
    const url = `${global.base_url}AccessPolicyService/getAccessPoliciesByOrgId?orgId=${orgId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  addAccessPolicyMapping(etId, apId):any{
    const url = `${global.base_url}AccessPolicyService/addAccessPolicyMapping?etVsId=${etId}&apId=${apId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }

  getAccessPolicyMappings(orgId):any{
    const url = `${global.base_url}AccessPolicyService/getAccessPolicyMappings?orgId=${orgId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  removeAccessPolicyMapping(mappingid):any{
    const url = `${global.base_url}AccessPolicyService/removeAccessPolicyMapping?mappingid=${mappingid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }

  removeAccessPolicy(apid){
    const url = `${global.base_url}AccessPolicyService/removeAccessPolicy?apid=${apid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
   setMultiAccessPolicyPermissions(permissions: any): any {
    if(permissions._$visited){
      delete permissions._$visited;
    }
    const url = `${global.base_url}AccessPolicyService/setMultiAccessPolicyPermissions`;
     return this.http.post(url,permissions,{responseType:'text'});
  }

  getMappedETForAcessPolicy(apId):any{
    const url = `${global.base_url}AccessPolicyService/getMappedETForAcessPolicy?apId=${apId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
}
