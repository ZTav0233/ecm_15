import {Injectable} from '@angular/core';
import * as global from '../global.variables';
import 'rxjs';
import {UserService} from '../services/user.service';
import {HttpClient,HttpHeaders} from "@angular/common/http";
// import {Http, RequestOptions, ResponseContentType} from "@angular/http";
import {CoreService} from "./core.service";
declare var ie11_polyfill: any;
@Injectable()
export class DocumentService {
  private current_user: any;
  private base_url: string;
  public cartItems: any[] = [];
  public cartFolderId = '';
  public enclosureCartItems: any[] = [];
  public enclosureCartFolderId = '';
  public addToFolderId:any;
  savedFolderBrowse={folderResultsSavedBrowse:[],folderPathSavedBrowse:'',folderTreeSaved:[],setSelectedFolder:[],selectedFolderId:''};
  savedFolderFav={folderResultsSavedFav:[],folderPathSavedFav:'',folderTreeSavedFav:[],setSelectedFolder:[],selectedFolderId:''};
  savedFolderBrowseDialog={folderResultsSavedBrowse:[],folderPathSavedBrowse:'',folderTreeSaved:[],setSelectedFolder:[],selectedFolderId:''};
  savedSearch={searchResultsSaved:{continueData:undefined,totalResults:0,row:[]},advanceSearchSaved:[],
    simpleSearchText:'',searchCriteria:'',et:{value:'',label:''},documentClassSaved:'',ets:{props:''},selectedSavedSearchObj:undefined,maxResult:'',
  isCurrentVersion:true};
  navfolderPath:any = "";
  navfolderId:any = "";
  notRootPath:any;
  checkedCartItems:any=[];
  public savedSearches: any[] = [];
  constructor(private http: HttpClient, private us: UserService, private coreService: CoreService){

    this.current_user = us.getCurrentUser();
  }
 
  refreshCart(data):any{
    this.cartFolderId = data.cfid;
    this.cartItems.splice(0, this.cartItems.length);
    Object.assign(this.cartItems, data.cart);
  }
  refreshEnclosureCart(data):any{
    this.enclosureCartFolderId = data.cfid;
    this.enclosureCartItems.splice(0, this.enclosureCartItems.length);
    Object.assign(this.enclosureCartItems, data.cart);
  }
 
  addDocument(formdata: any):any{
    const url = `${global.base_url}DocumentService/addDocument`;
    return this.http.post(url, formdata,{responseType:'text'});
  }
 
  addToFavorites(empno, id):any{
    const url = `${global.base_url}DocumentService/addToFavorites?empno=${ie11_polyfill(JSON.stringify(empno))}&id=${ie11_polyfill(id)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  addToFavoritesMulti(postdata: any):any{
    if(postdata.empNo){
      postdata.empNo=ie11_polyfill(JSON.stringify(postdata.empNo));
    }
    const url = `${global.base_url}DocumentService/addToFavoritesMulti`;
    return this.http.post(url, postdata);
  }
 
  removeFromFavMulti(postdata: any):any{
   if(postdata.empNo){
      postdata.empNo=ie11_polyfill(JSON.stringify(postdata.empNo));
    }
    const url = `${global.base_url}DocumentService/removeFromFavMulti`;
    return this.http.post(url, postdata);
  }
 
  removeFromCartMulti(postdata: any):any{
    if (!(this.current_user && this.current_user.hasOwnProperty('EmpNo'))){
      this.current_user = this.us.getCurrentUser();
    }
    postdata.empNo=this.current_user.EmpNo;
    const url = `${global.base_url}DocumentService/removeFromCartMulti`;
    return this.http.post(url, postdata);
  }
 
  moveMultipleDocuments(moveToFolder):any{
    const url = `${global.base_url}DocumentService/moveMultipleDocuments`;
    return this.http.post(url, moveToFolder,{responseType:'text'});
  }
 
  getDocument(id: any):any{
    const url = `${global.base_url}DocumentService/getDocument?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getThisDocument(id: any):any{
    const url = `${global.base_url}DocumentService/getThisDocument?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getTeamDocuments(empno):any{
    const url = `${global.base_url}DocumentService/getTeamDocuments?empno=${ie11_polyfill(JSON.stringify(empno))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getLinks(id: any):any{
    const url = `${global.base_url}DocumentService/getLinks?docid=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  checkOut(id: any):any{
    const url = `${global.base_url}DocumentService/checkOut?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  checkIn(formdata: any):any{
    const url = `${global.base_url}DocumentService/checkIn`;
    return this.http.post(url, formdata,{responseType:'text'});
  }
 
  cancelCheckOut(id: any):any{
    const url = `${global.base_url}DocumentService/cancelCheckOut?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  linkDocuments(id1: any, id2: any):any{
    const url = `${global.base_url}DocumentService/linkDocuments?firstid=${id1}&secondid=${id2}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  removeLink(id1: any, id2: any):any{
    const url = `${global.base_url}DocumentService/removeLink?firstid=${id1}&secondid=${id2}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  deleteDocuments(ids): any {
    const url = `${global.report_url}DocumentService/deleteDocuments`;
    //return this.http.post(url, ids,{responseType:'text'});
    return this.http.post(url, ids);
  }
 
  deleteMemoDocument(docId: any):any{
    const url = `${global.report_url}DocumentService/deleteMemoDocument?mdId=${docId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  removeFromFavorites(empno, id):any{
    const url = `${global.base_url}DocumentService/removeFromFavorites?empno=${ie11_polyfill(JSON.stringify(empno))}&id=${ie11_polyfill(id)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  getFavourites(empno):any{
    const url = `${global.base_url}DocumentService/getFavorites?empno=${ie11_polyfill(JSON.stringify(empno))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getRecent(empno):any{
    const url = `${global.base_url}DocumentService/getRecent?empno=${ie11_polyfill(JSON.stringify(empno))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getDocumentVersions(id: any):any{
    const url = `${global.base_url}DocumentService/getDocumentVersions?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getDocumentPermissions(id: any):any{
    const url = `${global.base_url}DocumentService/getDocumentPermissions?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getDocumentAdhocPermissions(id: any):any{
    const url = `${global.base_url}DocumentService/getDocumentAdhocPermissions?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  setDocumentAdhocPermissions(json):any{
    const url = `${global.base_url}DocumentService/setDocumentAdhocPermissions`;
    return this.http.post(url,json,{responseType:'text'});
  }
 
  getDocumentHistory(id: any):any{
    const url = `${global.base_url}DocumentService/getDocumentHistory?docid=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
 
  }
 
  getDocumentWorkflowHistory(id: any,vsid: any):any{
    const url = `${global.base_url}DocumentService/getDocumentWorkflowHistory?docid=${id}&vsid=${vsid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getDocumentWorkItemByUser(docid: any,vsid: any,wfid: any,empno: any):any{
    const url = `${global.base_url}DocumentService/getDocumentWorkItemByUser?docid=${docid}&vsid=${vsid}&empno=${empno}&wfid=${wfid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getCart(id):any{
    const url = `${global.base_url}DocumentService/getCart?empno=${ie11_polyfill(JSON.stringify(id))}&cfid=&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getEnclosureCart(id):any{
    //Abhishek 13.12.2022 - removed cfid value
    const url = `${global.base_url}DocumentService/getEnclosure?empno=${ie11_polyfill(JSON.stringify(id))}&cfid=&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  verifyDocOCRStatus(id: any):any{
    const url = `${global.base_url}DocumentService/verifyDocOCRStatus?docid=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
  setWorkflowPolicies(query) {
    const url = `${global.report_url}DocumentService/setWorkflowPolicies`;
    return this.http.post(url, query, {responseType: 'text'});
  }
 
  addToCart(empNo, id):any{
    const url = `${global.base_url}DocumentService/addToCart?empno=${ie11_polyfill(JSON.stringify(empNo))}&id=${ie11_polyfill(id)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  addToCartMulti(postArray: any):any{
    postArray.cfid=this.cartFolderId;
    const url = `${global.base_url}DocumentService/addToCartMulti`;
    return this.http.post(url, postArray);
  }
 
  addToEncMulti(postArray: any):any{
    //postArray.cfid=this.cartFolderId; //Abhishek 13.12.2022
    const url = `${global.base_url}DocumentService/addToEncMulti`;
    return this.http.post(url, postArray);
  }
 
  checkForSameNameDoc(docs, name, id) {
    let exists = false;
    docs.map(doc => {
      if (name === doc.fileName && doc.id !== id) {
        exists = true;
      }
    });
    return exists;
  }
 
  removeFromCart(empNo: any, id: any):any{
    const url = `${global.base_url}DocumentService/removeFromCart?empno=${ie11_polyfill(JSON.stringify(empNo))}&id=${ie11_polyfill(id)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
  removeFromEnclosure(empNo: any, id: any):any{
    const url = `${global.base_url}DocumentService/removeFromEnclosure?empno=${ie11_polyfill(JSON.stringify(empNo))}&id=${ie11_polyfill(id)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  searchDocuments(request: any): any {
    const url = `${global.base_url}DocumentService/pagingSearch`;
    return this.http.post(url, request);
  }
  icnSearch(request: any): any {
    const url = `${global.base_url}DocumentService/icnSearch`;
    return this.http.post(url, request);
  }
   continueSearch(request: any): any {
    const url = `${global.base_url}DocumentService/continueSearch`;
    return this.http.post(url, request);
  }
  // continueSearch(request: any): any {
  //   const url = `${global.base_url}DocumentService/continueSearch`;
  //   return this.http.post(url, request);
  // }
 
  //  downloadDocumentPanel(id: any): any {
  //   let options = new RequestOptions({responseType: ResponseContentType.Blob });
  //   const url = `${global.base_url}DocumentService/downloadDocument?id=${id}`;
  //   return this.htt.get(url,options);
  // }
 
  downloadDocument(id: any): any {
    const url = `${global.base_url}DocumentService/downloadDocument?id=${id}`;
    return url;
  }
 
  downloadThisDoc(id: any): any {
    console.log("downloadThisDoc");
    
    // const url = `${global.base_url}DocumentService/downloadThisDocument?id=${id}`;
    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // const options = {
    //   responseType: 'blob' as 'blob', // Set responseType to 'blob' explicitly
    //   headers,
    // };
    // return this.http.get(url, options);
    let options = new HttpHeaders();
    const url = `${global.base_url}DocumentService/downloadThisDocument?id=${id}`;
    return this.http.post(url, options);
  }
 
  downloadThisDocument(id: any): any {
    const url = `${global.base_url}DocumentService/downloadDocument?id=${id}`;
    return url;
  }
 
  validateDocument(id: any): any {
    const url = `${global.base_url}DocumentService/validateDocument?id=${id}`;
    return url;
  }
 
  previewMemo(id: any): any {
    const url = `${global.base_url}MemoService/previewMemo?id=${id}`;
    return url;
  }
 
 
   downloadPDF(id: any): any {
    const url = `${global.base_url}DocumentService/downloadThisDocument?id=${id}`;
     return this.http.get(url,{responseType:"blob"});
  }
 
  downloadMultipleDocument(doc): any {
    const url = `${global.base_url}DocumentService/downloadMultipleDocuments`;
    return this.http.post(url, doc,{responseType:"blob"});
  }
 
  emailDocuments(doc ): any {
    const url = `${global.base_url}DocumentService/emailDocuments`;
    return this.http.post(url, doc,{responseType:"blob"
    });
  }
 
  // getRequest(reqId: any):any{
  //   const url = `${global.base_url}ESignService/getRequest?id=${reqId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
  //   return this.http.get(url);
  // }
 
  setAccessPolicy(docid: any, apid: any, apno: any):any{
    const url = `${global.base_url}DocumentService/setAccessPolicy?docid=${docid}&apid=${apid}&apno=${apno}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  updateProperties(prop: any): any {
    const url = `${global.base_url}DocumentService/updateProperties`;
    return this.http.post(url, prop,{responseType:'text'});
  }
 
  getViewUrl(docid: any): any {
    //const url = `${global.winxt_url}?id=%7B${docid.replace('{', '').replace('}', '')}%7D&objectStoreName=UAT&objectType=document`;
    const url = `${global.winxt_url}&docid=%7B${docid.replace('{', '').replace('}', '')}%7D&embedded=true`;
    return url;
  }
 
  getDocumentFolders(docid: any):any{
    const url = `${global.base_url}DocumentService/getDocumentFolders?id=${docid}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  getDocumentInfo(docid: any,isprop:any):any
  {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}DocumentService/getDocumentInfo?id=${docid}&empno=${ie11_polyfill(JSON.stringify(user.EmpNo))}&isprops=${ie11_polyfill(JSON.stringify(isprop))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  verifyESign(docid: any, witemid: any,flagInitial:any):any{
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ESignService/verifyESign?docid=${docid}&witemid=${witemid}&initial=${flagInitial}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  verifyESignStatusService(docid: any, witemid: any,flagInitial:any):any{
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}ESignService/verifyESignStatus?docid=${docid}&witemid=${witemid}&initial=${flagInitial}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
 
  exportFolderDocuments(json,path){
    let jsonObject = {setCount:json.length, folderPath:path, documents:json};
    const url = `${global.base_url}DocumentService/exportFolderDocuments?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, jsonObject,{responseType:"blob"});
  }
 
  exportSearchResult(queary){
    const url = `${global.base_url}DocumentService/exportSearchToExcel`;
    return this.http.post(url, queary ,{responseType:"blob"});
  }
 
  validateDocumentPermissions(id: any):any{
    const url = `${global.base_url}DocumentService/validateDocumentPermissions?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:"text"});
  }
 
  getDocumentDetails(id,empNo):any{
    const url = `${global.base_url}DocumentService/getDocumentDetails?id=${ie11_polyfill(id)}&empno=${ie11_polyfill(JSON.stringify(empNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  getThisDocumentDetails(id: any,empNo: any):any{
    const url = `${global.base_url}DocumentService/getThisDocumentDetails?id=${id}&empno=${empNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
 
  setLastSearchToLocalStorage() {
    //console.log('setLastSearchToLocalStorage');
    localStorage.setItem('LastSearch', JSON.stringify(this.savedSearch));
  }
 
  getLastSearchToLocalStorage() {
    //console.log('getLastSearchToLocalStorage');
    let savedSearch = JSON.parse(localStorage.getItem('LastSearch'));
    if (savedSearch){
      this.savedSearch = savedSearch;
    }
  }
}