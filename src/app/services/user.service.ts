import {Injectable} from '@angular/core';
// import {User} from '../models/user/user.model';
import * as global from '../global.variables';
// import 'rxjs/Rx';
// import 'rxjs/add/operator/timeout';
import {HttpClient} from "@angular/common/http";
import {CoreService} from "./core.service";
import * as polyfill from '../../assets/js/Resources/polyfill.js';
declare var ie11_polyfill: any;

@Injectable()
export class UserService {
  private base_url: string;
  private user: any;
  selectedTheme = 'bluegrey:moody';
  defaultView = 'dashboard';
  pageSize: any = 5;
  defaultViewSubMenuExpanded: any;
  public userSettings;
  constructor(private http: HttpClient, private coreService: CoreService) {
    this.base_url = global.base_url;
    this.assignGeneralSettings();
  }

 getInactiveRoles(): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getInactiveRoles?userid=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,);
  }
  activateRole(roleId): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/activateRole?roleId=${roleId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }

  saveAdminUser(adminUser): any {
    const url = `${global.base_url}UserService/saveAdminUser`;
    return this.http.post(url, adminUser, {responseType: 'text'});
  }
  saveExcludedUser(empNo,id): any {
    const url = `${global.base_url}UserService/saveExcludedUser?empNo=${empNo}&id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }
  getExcludedUsers(): any {
    const url = `${global.base_url}UserService/getExcludedUsers?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getAdminUsers(): any {
    const url = `${global.base_url}UserService/getAdminUsers?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRoleInfoById(id): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getRoleInfo?id=${id}&userid=${user.userName}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }


  assignGeneralSettings(cb?) {
    if (localStorage.getItem('user') !== null) {
      this.getUserSettings().subscribe((val: any) => {
        this.userSettings = val;
        val.map((d, i) => {
          if (d.key === 'Default Theme') {
            this.selectedTheme = d.val;
            this.applyTheme();
          }
          if (d.key === 'Default View') {
            this.defaultView = d.val;
            localStorage.setItem('defaultView', this.defaultView);
          }
          if (d.key === 'Page Size' && d.hasOwnProperty('val') && d.val) {
            this.pageSize = parseInt(d.val, 10);
          }
        });
        if (cb) {
          cb();
        }
      });
    }
  }

  changeTheme(theme) {
    const themeLink: HTMLLinkElement = <HTMLLinkElement> document.getElementById('theme-css');
    themeLink.href = 'assets/theme/theme-' + theme + '.css';
  }

  changeLayout(theme) {
    const layoutLink: HTMLLinkElement = <HTMLLinkElement> document.getElementById('layout-css');
    layoutLink.href = 'assets/layout/css/layout-' + theme + '.css';
  }

  applyTheme(): any {
    const style = /(.+):(.+)/.exec(this.selectedTheme);
    this.changeTheme(style[1]);
    this.changeLayout(style[2]);
  }

  setCurrentUser(userData): any {
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }

  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('user'));
  }

  getUsers(): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getUsers?userid=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getUserSettings(): any {
    const user = this.getCurrentUser();
    const appname = 'ECM';
    const url = `${global.base_url}UserService/getUserSettings?empNo=${user.EmpNo}&appid=${appname}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getUserSearches(): any {
    const user = this.getCurrentUser();
    const appname = 'ECM';
    const url = `${global.base_url}UserService/getUserSearches?empNo=${user.EmpNo}&appid=${appname}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getUserDelegation(): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getUserDelegations?userid=${JSON.stringify(user.EmpNo)}&usertype=${'USER'}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getUserDelegationForSelectedUser(empNo): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getUserDelegations?userid=${empNo}&usertype=${'USER'}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRoleDelegation(roleId): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getUserDelegations?userid=${JSON.stringify(roleId)}&usertype=${'ROLE'}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  saveRole(json: any): any {
    if(json._$visited){
      delete json._$visited;
    }
    json=json;
    const url = `${global.base_url}UserService/saveRole`;
    return this.http.post(url, json, {responseType: 'text'});
  }

  deactivateRole(roleId): any {
    const url = `${global.base_url}UserService/deleteRole?roleId=${roleId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  deleteRole(roleId): any {
    const url = `${global.base_url}UserService/removeRole?roleId=${roleId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  saveReportUser(empNo, id, isadmin,isupdate): any {
    const url = `${global.base_url}UserService/saveReportUser?empNo=${empNo}&id=${id}&isadmin=${isadmin}&isupdate=${isupdate}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});

  }

  saveUser(json: any): any {
    json=json;
    const url = `${global.base_url}UserService/saveUser`;
    return this.http.post(url, json, {responseType: 'text'});
  }

  saveDelegation(json: any): any {
    json=json;
    const url = `${global.base_url}UserService/saveDelegation`;
    return this.http.post(url, json, {responseType: 'text'});
  }

  updateUserSettings(generalsettings: any): any {
    const url = `${global.base_url}UserService/updateUserSettings`;
    return this.http.post(url, generalsettings, {responseType: 'text'});
  }

  updateUserSearches(generalsettings: any): any {
    const url = `${global.base_url}UserService/updateUserSearches`;
    return this.http.post(url, generalsettings, {responseType: 'text'});
  }

  revokeDelegation(id: any): any {
    const url = `${global.base_url}UserService/revokeDelegation?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  searchUsers(text: any): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/searchUsers?text=${text}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  searchEcmUsers(searchQueary: any): any {
    searchQueary=searchQueary;
    const url = `${global.base_url}UserService/searchECMUsers`;
    return this.http.post(url, searchQueary);
  }

  searchOrgECMUsers(searchQueary: any): any {
    searchQueary=searchQueary;
    const url = `${global.base_url}UserService/searchOrgECMUsers`;
    return this.http.post(url, searchQueary);
  }

  getRolesByMember(userid,type,empNo): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getRolesByMember?userid=${userid}&type=${type}&empNo=${empNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRoleByOrgCode(uOrgCode: any):any {
    const url = `${global.base_url}UserService/getRolesByOrgCode?orgCode=${uOrgCode}`;
    return this.http.get(url);
  }

  searchUsersList(usertype: any, text: any, key: any, filter: any): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/searchUsers?key=${key}&text=${text}&usertype=${usertype}&filter=${filter}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  removeDistList(listId, empno,isGlobal): any {
    const url = `${global.base_url}UserService/removeUserList?empno=${empno}&list=${listId}&isGlobal=${isGlobal}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }
//userType
  removeDefaultList(userType,listEmpNo, empno): any {
    const url = `${global.base_url}UserService/removeDefaultList?userType=${userType}&empno=${empno}&removeUser=${listEmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  getActiveRolesList(): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getOrgRoles&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getTopRolesList(): any {
    const url = `${global.base_url}UserService/getTopOrgRole?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getTopRolesListForAdmin(): any {
    const url = `${global.base_url}UserService/getTopOrgRoleForAdmin?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getTopOrgUnits(): any {
    const url = `${global.base_url}UserService/getTopOrgUnits?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getSubRolesList(orgid: any): any {
    const url = `${global.base_url}UserService/getSubOrgRoles?orgid=${orgid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
   getSubRolesListForAdmin(orgid: any): any {
    const url = `${global.base_url}UserService/getSubOrgRolesForAdmin?orgid=${orgid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getSubOrgUnits(orgCode): any {
    const url = `${global.base_url}UserService/getSubOrgUnits?orgcode=${orgCode}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRoles(): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getRoles?userid=${user.userName}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRolesByType(typeId: number,pRole): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getRolesByType?userid=${user.userName}&type=${typeId}&pRole=${pRole}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRolesByTypeForUI(typeId: number,pRole): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getRolesByTypeForUI?userid=${user.userName}&type=${typeId}&pRole=${pRole}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRoleTreeExpandedForUI(): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getRoleTreeExpandedForUI?userid=${user.userName}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getOrgUnitsByType(type): any {
    const url = `${global.base_url}UserService/getOrgUnitsByType?type=${type}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getUserRoles(userid): any {
    const url = `${global.base_url}UserService/getUserRoles?userid=${userid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
   getActiveUserRoles(userid): any {
    const url = `${global.base_url}UserService/getActiveUserRoles?userid=${userid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRoleMembers(roleid): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getRoleMembers?roleId=${roleid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getRoleMembersForSettings(roleid): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getRoleMembersForSettings?roleId=${roleid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  addUserList(id: any, list: any): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/addUserList?userid=${user.EmpNo}&addedUser=${id}&type=${list}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  removeUserList(id, list): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/removeUserList?userid=${user.EmpNo}&removeUser=${id}&type=${list}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  logIn(username: any, password: any): any {
    //username=encrypt(username);
    username='IiU1Wi8g';
    const url = `${global.base_url}UserService/getUserDetails?userid=${username}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  exit(): any {
    // console.log('timeout')
    //  window.location.assign('http://192.168.8.101:9080/ECMService/success.html');
  }

  // new
  getUserLists(isglobal): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getUserLists?empno=${user.EmpNo}&global=${isglobal}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getListUsers(listId): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/getListUsers?empno=${user.EmpNo}&list=${listId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  updateUserList(updatedUserList: any): any {
    updatedUserList=updatedUserList;
    const url = `${global.base_url}UserService/updateUserList?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, updatedUserList, {responseType: 'text'});
  }

  updateUserLists(updatedUserList: any): any {
    const url = `${global.base_url}UserService/updateUserList?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, updatedUserList, {responseType: 'text'});
  }

  addUserToRole(empNo, roleId): any {
    const url = `${global.base_url}UserService/addUserToRole?empNo=${empNo}&roleId=${roleId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  removeUserFromRole(empNo, roleId): any {
    const url = `${global.base_url}UserService/removeUserFromRole?empNo=${empNo}&roleId=${roleId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  getUserSupervisorTree(empNo): any {
    const url = `${global.base_url}UserService/getUserSupervisorTree?empNo=${empNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getECMUsers(): any {
    const url = `${global.base_url}UserService/getUsers?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getRoleById(id,userid): any {
    const url = `${global.base_url}UserService/getRoleById?id=${id}&userid=${userid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getReportUsers(): any {
    const url = `${global.base_url}UserService/getReportUsers?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  validateDelegation(delid): any {
    const url = `${global.base_url}UserService/validateDelegation?delid=${delid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  validateRole(roleId): any {
    const user = this.getCurrentUser();
    const url = `${global.base_url}UserService/validateRole?roleid=${roleId}&userid=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  exportUsers(){
    const url = `${global.base_url}UserService/exportUsers?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:"blob"});
  }
   exportRoles(){
    const url = `${global.base_url}UserService/exportRoles?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:"blob"});
  }

  loadUserSettings(cb?){
    this.getUserSettings().subscribe(res=>{
      this.userSettings=res;
      if (cb)
        cb();
    });
  }

  getUserSettingsFormMemory(){
    if (this.userSettings){
      return this.userSettings;
    } else {
      this.loadUserSettings(()=>{
        return this.userSettings;
      });
    }
  }

  updateSettings(val){
    this.userSettings = val;
  }
}


