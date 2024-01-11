import {Injectable} from '@angular/core';
import {Output, EventEmitter} from '@angular/core';
import {User} from '../models/user/user.model';
import * as global from '../global.variables';
import 'rxjs';
import {UserService} from '../services/user.service';
import {HttpClient} from "@angular/common/http";
import {CoreService} from "./core.service";
import {Observable} from "rxjs";
declare var ie11_polyfill: any;

@Injectable()
export class AdminService {
  private base_url: string;
  private user: User;
  public designationValues:any=[];

  constructor(private http: HttpClient, private us: UserService, private coreService: CoreService) {
    this.base_url = global.base_url;
    this.user = us.getCurrentUser();
  }

  getLDAPGroups(grantee,type){
    const url = `${global.base_url}AdministrationService/getLDAPGroups?grantee=${grantee}&type=${type}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getAdminLogs(): any {
    const url = `${global.base_url}AdministrationService/getAdminLogs?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getLookups(): any {
    const url = `${global.base_url}AdministrationService/getLookups?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }


  getLookupsByOrgUnit(orgId): any {
    const url = `${global.base_url}AdministrationService/getLookupsByOrgId?orgid=${orgId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getNextECMNo(): any {
    const url = `${global.base_url}AdministrationService/getNextECMNo?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  getTopLevelOrgUnit(): any {
    const url = `${global.base_url}AdministrationService/getTopLevelOrgUnit?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getSubLevelOrgUnits(orgId): any {
    const url = `${global.base_url}AdministrationService/getSubLevelOrgUnits?orgId=${orgId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    // return this.http.get(url);
    return this.http.get('./assets/data/getSubLevelOrgUnits3.json');
  }

  getOrgUnitsByTypeAndTypeAndStatus(type: string, status: string): any {
    const url = `${global.base_url}AdministrationService/getOrgUnitsByTypeAndStatus?orgType=${type}&status=${status}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getInactiveOrgUnits(): any {
    const url = `${global.base_url}AdministrationService/getInactiveOrgUnits?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getDocOCRDetails(): any {
    const url = `${global.base_url}AdministrationService/getDocOCRDetails?status=${1}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  updateDocOCRStatus(docid,justification): any {
    const url = `${global.base_url}AdministrationService/updateDocOCRStatus?docid=${docid}&msg=${justification}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }

  deactivateOrgUnit(id: any, level): any {
    const url = `${global.base_url}AdministrationService/deactivateOrgUnit?orgId=${id}&level=${level}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }

  activateOrgUnit(id: any): any {
    const url = `${global.base_url}AdministrationService/activateOrgUnit?orgId=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }

  deleteOrgUnit(id): any {
    const url = `${global.base_url}AdministrationService/deleteOrgUnit?orgId=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  getOrgUnitInfo(id: any): any {
    const url = `${global.base_url}AdministrationService/getOrgUnitInfo?orgId=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getLookupValues(id: any): any {
    const url = `${global.base_url}AdministrationService/getLookupValues?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }


  getLookupDependentValues(id: any, lkpVal: any): any {
    const url = `${global.base_url}AdministrationService/getDependentLookupValues?id=${id}&key=${lkpVal}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  searchLDAPUsers(searchText: any): any {
    const url = `${global.base_url}AdministrationService/searchLDAPUsers?user=${searchText}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  searchLDAPGroups(searchText: any): any {
    const url = `${global.base_url}AdministrationService/searchLDAPGroups?group=${searchText}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  saveLookup(name: any, id: any): any {
    const url = `${global.base_url}AdministrationService/saveLookup?name=${name}&id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  updateLookupValues(saveArray: any): any {
    const url = `${global.base_url}AdministrationService/updateLookupValues?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, saveArray, {responseType: 'text'});
  }

  addLookupMapping(orgUnit: any, templid: any, prop: any, lookupId: any): any {
    const url = `${global.base_url}AdministrationService/addLookupMapping?id=${lookupId}&orgUnit=${orgUnit}&templid=${templid}&prop=${prop}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  removeLookupMapping(orgUnit: any, templid: any, prop: any): any {
    const url = `${global.base_url}AdministrationService/removeLookupMapping?orgUnit=${orgUnit}&templid=${templid}&prop=${prop}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  getLookupMappings(): any {
    const url = `${global.base_url}AdministrationService/getLookupMappings?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  searchOrgUnits(text: any): any {
    const url = `${global.base_url}AdministrationService/searchOrgUnits?text=${text}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getIntegrations(): any {
    const url = `${global.base_url}IntegrationService/getIntegrations?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  saveIntegrations(json): any {
    //json=ie11_polyfill(JSON.stringify(json));
    const url = `${global.base_url}IntegrationService/saveIntegration?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, json, {responseType: 'text'});
  }

  deleteIntegrations(id): any {
    const url = `${global.base_url}IntegrationService/deleteIntegration?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  getOrgUnitsByEntryTemplate(etId: any): any {
    const url = `${global.base_url}AdministrationService/getOrgUnitsByEntryTemplate?etId=${etId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getLogs(): any {
    const url = `${global.base_url}AdministrationService/getLogs?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getLogDetails(logid): any {
    const url = `${global.base_url}AdministrationService/getLogDetails?logid=${logid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  addEntryTemplateMapping(orgid: any, etId: any, isvisible: any, etVsId: any): any {
    const url = `${global.base_url}AdministrationService/addEntryTemplateMapping?orgid=${orgid}&etId=${etId}&isvisible=${isvisible}&etVsId=${etVsId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  removeEntryTemplateMapping(orgId: any, etId: any): any {
    const url = `${global.base_url}AdministrationService/removeEntryTemplateMapping?orgId=${orgId}&etId=${etId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  removeLookup(id): any {
    const url = `${global.base_url}AdministrationService/removeLookup?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  removeLookupValue(id, lookupid): any {
    const url = `${global.base_url}AdministrationService/removeLookupValue?id=${id}&lookupid=${lookupid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, {responseType: 'text'});
  }

  getLookupsByOrgId(orgid): any {
    const url = `${global.base_url}AdministrationService/getLookupsByOrgId?orgid=${orgid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getLookupMappingsByOrg(orgid, etvsid): any {
    const url = `${global.base_url}AdministrationService/getLookupMappingsByOrg?orgid=${orgid}&etvsid=${etvsid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getLookupMappingByTemplate(prop, etvsid): any {
    const url = `${global.base_url}AdministrationService/getLookupMappingByTemplate?prop=${prop}&etvsid=${etvsid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  exportLookups(){
    const url = `${global.base_url}AdministrationService/exportLookups?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:"blob"});
  }

  deleteEntryTemplate(etId,etVsId){
    const url = `${global.base_url}AdministrationService/deleteEntryTemplate?etId=${etId}&etVsId=${etVsId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:"text"});
  }

  public getDesignationData(): Observable<any> {
    return this.http.get('./assets/data/getDesignationValues.json');
  }
   public getSearchData(): Observable<any> {
    return this.http.get('./assets/data/getSearchData.json');
  }
   public getSearchDataFinal(): Observable<any> {
    return this.http.get('./assets/data/getSearchDataFinal.json');
  }
  // public getSearchData(): Observable<any> {
  //   return this.http.get('./assets/data/searchResultJson.json');
  // }

  getDesignationValues(): any {
    const url = `${global.base_url}AdministrationService/getDesignationValues?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get('./assets/data/getDesignationValues.json');
  }
  getclassDefinitions(): any {
    const url = `${global.sectool_url}SecurityTool/classDefinitions?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  entryTemplates(cldID): any {
    const url = `${global.sectool_url}SecurityTool/entryTemplates?clsSN=${cldID}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getAllOperations(): any {
    const url = `${global.sectool_url}SecurityTool/operations?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getOperationLogs(operationID,pageNo,type): any {
    const url = `${global.sectool_url}SecurityTool/operation/logs?operationID=${operationID}&pageNo=${pageNo}&run=${type}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getOperationLogsFilter(filterText,operationID,pageNo,type): any {
    const url = `${global.sectool_url}SecurityTool/operation/logs?filterText=${filterText}&operationID=${operationID}&pageNo=${pageNo}&run=${type}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  operationRefresh(operationID): any {
    const url = `${global.sectool_url}SecurityTool/operation/refresh?operationID=${operationID}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  // permissionDetails(type): any {
  //   const url = `${global.sectool_url}SecurityTool/operation/permission?type=${type}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
  //   return this.http.get(url);
  // }
  operationDetails(operationID): any {
    const url = `${global.sectool_url}SecurityTool/operation/details?operationID=${operationID}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  operationRemove(operationID): any {
    const url = `${global.sectool_url}SecurityTool/operation/remove?operationID=${operationID}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }
  operationPause(operationID): any {
    const user = this.us.getCurrentUser();
    const url = `${global.sectool_url}SecurityTool/operation/pause?operationID=${operationID}&user=${user.userName}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }
  runFailed(operationID): any {
    const user = this.us.getCurrentUser();
    const url = `${global.sectool_url}SecurityTool/operation/runFailed?operationID=${operationID}&user=${user.userName}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }
  operationResume(operationID): any {
    const user = this.us.getCurrentUser();
    const url = `${global.sectool_url}SecurityTool/operation/resume?operationID=${operationID}&user=${user.userName}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }
  operationUpdate(operationID): any {
    const user = this.us.getCurrentUser();
    const url = `${global.sectool_url}SecurityTool/operation/update?operationID=${operationID}&user=${user.userName}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType: 'text'});
  }

  saveOrgUnit(json: any): any {
    const url = `${global.base_url}AdministrationService/saveOrgUnitData`;
    return this.http.post(url, json, {responseType: 'text'});
  }
  startOperation(json): any {
    //json=ie11_polyfill(JSON.stringify(json));
    const url = `${global.sectool_url}SecurityTool/startOperation?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, json, {responseType: 'text'});
  }
  saveOperation(json): any {
    const url = `${global.sectool_url}SecurityTool/saveOperation?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, json, {responseType: 'text'});
  }
  validateOrgDetails(value: any,type:any): any {
    const url = `${global.base_url}AdministrationService/validateOrgDetails?value=${value}&type=${type}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
   getConfiguration(): any {
    const url = `${global.base_url}ConfigurationService/getConfiguration?appId=ECM&scope=${'SYSTEM'}&key=${'COUNTLIMIT'}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  //http://localhost:9080/ECMService/resources/AdministrationService/validateStopWords?word=value
   validateStopWords(value: any):any{
    const url = `${global.base_url}AdministrationService/validateStopWords?word=${value}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
  getECMHelp(): any {
    const url = `${global.base_url}AdministrationService/getECMHelp?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
   getLogsForFilter(fromDate,toDate): any {
    let url = `${global.base_url}AdministrationService/getLogs?fromDate=${fromDate}&toDate=${toDate}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
}
