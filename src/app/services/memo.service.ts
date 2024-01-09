import { Injectable } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import * as global from '../global.variables';
import 'rxjs';
import { UserService } from './user.service';
import { HttpClient } from "@angular/common/http";
import { CoreService } from "./core.service";
import { BreadcrumbService } from "./breadcrumb.service";
import { Observable } from "rxjs";
import * as _ from 'lodash';
declare var ie11_polyfill: any
@Injectable()
export class MemoService {
    private current_user: any;
    constructor(private http: HttpClient, private us: UserService, private coreService: CoreService, private breadcrumbService: BreadcrumbService) {
        this.current_user = us.getCurrentUser();
    }
    getValidateRoleMemberByCurrentUser(selectedRoleId) {
        const user = this.us.getCurrentUser();
        console.log(selectedRoleId,user.EmpNo)
        const url = `${global.base_url}MemoService/validateRoleMemberbyUser?roleId=${ie11_polyfill(JSON.stringify(selectedRoleId))}&eNo=${ie11_polyfill(JSON.stringify(user.EmpNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url, { responseType: 'text' });
    }
 
    previewMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/previewMemo`;
        return this.http.post(url, memoDetails, {responseType:"blob"});
    }
   
    createMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/createMemo`;
        return this.http.post(url, memoDetails, { responseType: 'text' });
    }
    returnMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/replyMemo`;
        return this.http.post(url, memoDetails, { responseType: 'text' });
    }
    forwardMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/forwardMemo`;
        return this.http.post(url, memoDetails, { responseType: 'text' });
    }
    saveMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/saveMemo`;
        return this.http.post(url, memoDetails, { responseType: 'text' });
    }
    saveMemoAsTemplate(memoDetails: any): any {
        const url = `${global.base_url}MemoService/saveMemoAsTemplate`;
        return this.http.post(url, memoDetails, { responseType: 'text' });
    }
    submitMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/submitMemo`;
        return this.http.post(url, memoDetails, { responseType: 'text' });
    }
    submitForModifyMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/modifyMemo`;
        return this.http.post(url, memoDetails, { responseType: 'text' });
    }
    signAndSubmitMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/prepareMemoForSign`;
        return this.http.post(url, memoDetails, { responseType: 'text' });
    }
    getMemoById(memoId:any){
        // console.log(typeof(memoId))
        const url = `${global.base_url}MemoService/getMemoDetails?memoId=${ie11_polyfill(memoId)}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url);
    }
    getMemoRemarksById(memoId:any){
        console.log(memoId)
        const url = `${global.base_url}MemoService/getMemoRemarks?mId=${ie11_polyfill(memoId)}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url);
    }
    cancelMemo(memoId: any): any {
        const url = `${global.base_url}MemoService/cancelMemo?mId=${ie11_polyfill(memoId)}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url, { responseType: 'text' });
    }
    getOrgUnitbyOrgCode(orgCode:any){
        const url = `${global.base_url}AdministrationService/getOrgUnitbyOrgCode?orgcode=${orgCode}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url,);
    }
    getMemoLockStatus(mId:string,wId:String,rType:any,uType:any,uId:any){
        console.log("getMemoLockStatus" + mId,wId,rType,uType,uId)
        const user = this.us.getCurrentUser();
        const url =`${global.base_url}MemoService/getMemoLockStatus?mId=${ie11_polyfill(JSON.stringify(mId))}&uId=${ie11_polyfill(JSON.stringify(uId))}&wId=${ie11_polyfill(JSON.stringify(wId))}&rType=${ie11_polyfill(rType)}&uType=${ie11_polyfill(uType)}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url);
    }
    unLockMemo(mId:string,wId:String,rType:any,uType:any,uId:any){
        console.log("unLockMemo" + mId,wId,rType,uType,uId)
        //const user = this.us.getCurrentUser();
        const url = `${global.base_url}MemoService/unLockMemo?mId=${ie11_polyfill(JSON.stringify(mId))}&uId=${ie11_polyfill(JSON.stringify(uId))}&wId=${ie11_polyfill(JSON.stringify(wId))}&rType=${ie11_polyfill(rType)}&uType=${ie11_polyfill(uType)}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url, { responseType: 'text' });
    }
    updateMemoDate(mId:string,mDate:String){
        console.log("updateMemoDate" + mId,mDate)
        //const user = this.us.getCurrentUser();
        const url = `${global.base_url}MemoService/updateMemoDate?mId=${ie11_polyfill(JSON.stringify(mId))}&mDate=${ie11_polyfill(mDate)}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url, { responseType: 'text' });
    }
    lockMemo(mId:string,wId:String,rType:any,uType:any,uId:any){
        console.log("LockMemo" + mId,wId,rType,uType,uId)
        const user = this.us.getCurrentUser();
        const url = `${global.base_url}MemoService/lockMemo?mId=${ie11_polyfill(JSON.stringify(mId))}&uId=${ie11_polyfill(JSON.stringify(uId))}&wId=${ie11_polyfill(JSON.stringify(wId))}&rType=${ie11_polyfill(rType)}&uType=${ie11_polyfill(uType)}&sysdatetime=${this.coreService.getSysTimeStamp()}`
        return this.http.get(url, { responseType: 'text' });
    }

        //Added on 27-Dec-2023
        getMemoRefSettingsByRole(rId:string){
            console.log("getMemoRefSettingsByRole :: " + rId)
            const user = this.us.getCurrentUser();
            const url =`${global.base_url}MemoService/getMemoRefSettingsByRole?rId=${ie11_polyfill(JSON.stringify(rId))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
            return this.http.get(url);
        }
        saveMemoRefSettings(memoRefSettings: any): any {
            const url = `${global.base_url}MemoService/saveMemoRefSettings`;
            return this.http.post(url, memoRefSettings, { responseType: 'text' });
        }
        removeMemoRefSettings(memoRefId: any): any {
            const url = `${global.base_url}MemoService/removeMemoRefSettings?id=${ie11_polyfill(JSON.stringify(memoRefId))}&sysdatetime=${this.coreService.getSysTimeStamp()}`
            return this.http.get(url, { responseType: 'text' });
        }
        getMemoRefValuesByRole(rId:string){
            console.log("getMemoRefValuesByRole :: " + rId)
            const user = this.us.getCurrentUser();
            const url =`${global.base_url}MemoService/getMemoRefValuesByRole?rId=${ie11_polyfill(JSON.stringify(rId))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
            return this.http.get(url);
        }
        updateMemoRefCounter(rId:string, mRef:string){
            console.log("updateMemoRefUIDCounter :: " + rId)
            const user = this.us.getCurrentUser();
            const url =`${global.base_url}MemoService/updateMemoRefCounter?rId=${ie11_polyfill(JSON.stringify(rId))}&mRef=${ie11_polyfill(JSON.stringify(mRef))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
            return this.http.get(url, { responseType: 'text' });
        }
}