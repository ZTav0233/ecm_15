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
import * as polyfill from '../../assets/js/Resources/polyfill.js';
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
        const url = `${global.base_url}MemoService/validateRoleMemberbyUser?roleId=${selectedRoleId}&eNo=${user.EmpNo}`
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
    saveMemo(memoDetails: any): any {
        const url = `${global.base_url}MemoService/saveMemo`;
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
        const url = `${global.base_url}MemoService/getMemoDetails?memoId=${memoId}`
        return this.http.get(url);
    }
    getMemoRemarksById(memoId:any){
        console.log(memoId)
        const url = `${global.base_url}MemoService/getMemoRemarks?mId=${memoId}`
        return this.http.get(url);
    }
    cancelMemo(memoId: any): any {
        const url = `${global.base_url}MemoService/cancelMemo?mId=${memoId}`
        return this.http.get(url, { responseType: 'text' });
    }
    getOrgUnitbyOrgCode(orgCode:any){
        const url = `${global.base_url}AdministrationService/getOrgUnitbyOrgCode?orgcode=${orgCode}`
        return this.http.get(url,);
    }
    getMemoLockStatus(mId:string,wId:String,rType:any,uType:any,uId:any){
        console.log("getMemoLockStatus" + mId,wId,rType,uType,uId)
        const user = this.us.getCurrentUser();
        const url =`${global.base_url}MemoService/getMemoLockStatus?mId=${mId}&uId=${uId}&wId=${wId}&rType=${rType}&uType=${uType}`
        return this.http.get(url);
    }
    unLockMemo(mId:string,wId:String,rType:any,uType:any,uId:any){
        console.log("unLockMemo" + mId,wId,rType,uType,uId)
        //const user = this.us.getCurrentUser();
        const url = `${global.base_url}MemoService/unLockMemo?mId=${mId}&uId=${uId}&wId=${wId}&rType=${rType}&uType=${uType}`
        return this.http.get(url, { responseType: 'text' });
    }
    lockMemo(mId:string,wId:String,rType:any,uType:any,uId:any){
        console.log("LockMemo" + mId,wId,rType,uType,uId)
        const user = this.us.getCurrentUser();
        const url = `${global.base_url}MemoService/lockMemo?mId=${mId}&uId=${uId}&wId=${wId}&rType=${rType}&uType=${uType}`
        return this.http.get(url, { responseType: 'text' });
    }
}