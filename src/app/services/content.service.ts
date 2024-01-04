import { Injectable } from '@angular/core';
import { User } from '../models/user/user.model';
import * as global from '../global.variables';
import 'rxjs';
import { UserService } from '../services/user.service';
import { HttpClient } from "@angular/common/http";
import { CoreService } from "./core.service";
declare var ie11_polyfill: any;

@Injectable()
export class ContentService {
  private base_url: string;
  private user: User;
  public entryTemplatesListForSearchAndAdd = {
    'valueFetchedFromServer': false, 'addList': [], 'searchList': [],
    'entryTemplateForSearch': [], 'entryTemplateForAdd': []
  };
  public saveSearchForPagination: any;
  constructor(private http: HttpClient, private us: UserService, private coreService: CoreService) {
    this.base_url = global.base_url;
    this.user = us.getCurrentUser();
  }
  exportEntryTemplates() {
    const url = `${global.base_url}ContentService/exportEntryTemplates?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: "blob" });
  }
  clearCart(): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/clearCart?empno=${ie11_polyfill(JSON.stringify(user.EmpNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  getFolderDetails(id): any {
    const url = `${global.base_url}ContentService/getFolderDetails?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getTopFolders() {
    const url = `${global.base_url}ContentService/getTopFolders?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getSubFolders(id): any {
    const url = `${global.base_url}ContentService/getSubfolders?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  // getSearchTemplates(): any {
  //   const url = `${global.base_url}ContentService/getSearchTemplates&sysdatetime=${this.coreService.getSysTimeStamp()}`;
  //   return this.http.get(url);
  // }

  // getSearchTemplate(id: any):any{
  //   const url = `${global.base_url}ContentService/getSearchTemplate?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
  //   return this.http.get(url);
  // }

  getEntryTemplates(): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplates?empNo=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getEntryTemplatesByOrgId(orgId): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplatesByOrgId?orgId=${orgId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getAllEntryTemplates(): any {
    const url = `${global.base_url}ContentService/getAllEntryTemplates?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getEntryTemplate(id: any, vsid = ''): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplate?id=${id}&empNo=${user.EmpNo}&vsid=${vsid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getEntryTemplateForSearch(id: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplateForSearch?id=${id}&empNo=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getEntryTemplatesForSearch(): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplatesForSearch?empNo=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getEntryTemplatesForSearchAndAdd(): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplatesForSearchAndAdd?empNo=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  async getEntryTemplatesForSearchAndAddAsync(): Promise<any> {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplatesForSearchAndAdd?empNo=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return await this.http.get(url).toPromise();
  }

  getEntryTemplatesId(id: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplate?id=${id}&empNo=${user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getEntryTemplateForSearchId(id: any, vsid = ''): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getEntryTemplateForSearch?id=${id}&empNo=${user.EmpNo}&vsid=${vsid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  addFolderToFavorites(folderId): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/addFolderToFavorites?empno=${ie11_polyfill(JSON.stringify(user.EmpNo))}&id=${ie11_polyfill(folderId)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  getDocumentFolders(folid: any, doc?): any {
    if (!doc) {
      doc = '';
    }
    const url = `${global.base_url}ContentService/getFolderDocuments?id=${folid}&doc=${doc}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  unfileFromFolder(folderid, id): any {
    const url = `${global.base_url}DocumentService/unfileFromFolder?folderid=${folderid}&id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  fileInFolder(folderid, id): any {
    const url = `${global.base_url}DocumentService/fileInFolder?folderid=${folderid}&id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  getFolderPermissions(folderId: any): any {
    const url = `${global.base_url}ContentService/getFolderPermissions?id=${folderId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getFavoriteFolders() {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getFavoriteFolders?empno=${ie11_polyfill(JSON.stringify(user.EmpNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  createClassifyFolder(fName: any) {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/createClassifyFolder?name=${fName}&empno=${ie11_polyfill(JSON.stringify(user.EmpNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }

  getClassifySubFolders() {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getClassifySubFolders?empno=${ie11_polyfill(JSON.stringify(user.EmpNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getAccessPrivileges(mask): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/getAccessPrivileges?mask=${mask}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  removeFolderFromFavorites(folderid): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/removeFolderFromFavorites?empno=${ie11_polyfill(JSON.stringify(user.EmpNo))}&id=${ie11_polyfill(folderid)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  getEntryTemplateByOrgId(orgId): any {
    const url = `${global.base_url}ContentService/getEntryTemplatesByOrgId?orgId=${orgId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  removeFolder(folderid):any{
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ContentService/deleteFolder?id=${folderid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }

  validateFolderPermissions(id, permType): any {
    const url = `${global.base_url}ContentService/validateFolderPermissions?id=${id}&permType=${permType}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  moveFolderToFolder(sourceid: any, targetid: any): any {
    const url = `${global.base_url}ContentService/moveToFolder?sourceid=${sourceid}&targetid=${targetid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }
}
