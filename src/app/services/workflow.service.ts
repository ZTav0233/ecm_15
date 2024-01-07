import { Injectable } from '@angular/core';
import * as global from '../global.variables';
import 'rxjs';
import { UserService } from './user.service';
import { HttpClient } from "@angular/common/http";
import { CoreService } from "./core.service";
import { BreadcrumbService } from "./breadcrumb.service";
import { forkJoin } from "rxjs";
import * as _ from 'lodash';
declare var ie11_polyfill: any
@Injectable()
export class WorkflowService {
  private current_user: any;
  public inboxSelectedUserTab: any;
  public sentSelectedUserTab: any;
  public archiveSelectedUserTab: any;
  inboxMenu = {
    label: 'Inbox', icon: 'work', routerLink: ['/workflow/inbox'], badge: 0, command: (event) => {
      localStorage.removeItem('openWkItem')
    }
  };
  draftMenu = {
    label: 'Drafts',
    icon: 'drafts',
    routerLink: ['/workflow/draft'],
    routerLinkActiveOptions: { exact: true },
    badge: 0
  };
  public delegateId;
  public delegateEmpNo;
  public roleId;
  //public roleEmpNo;
  public pageNoSelected;
  public first;
  public openedWorkItem;
  public dashboardFilterQuery: any = {};
  public inboxFilterQuery: any = {};

  public inboxGridOptions: any = {};
  public workflowActions;
  constructor(private http: HttpClient, private us: UserService, private coreService: CoreService, private breadcrumbService: BreadcrumbService) {
    this.current_user = us.getCurrentUser();
    this.loadWorkflowActions();
  }

  resetInboxFilterQuery() {
    this.inboxFilterQuery = {
      status: null,
      subject: null,
      comments: null,
      type: null,
      selectedDeadline: null,
      senderName: null,
      priority: null,
      selectedReceivedDate: null,
      keywords: null,
      actions: null,
      actionId: null
    }
  }

  setInboxFilterQuery(property, value) {
    this.inboxFilterQuery[property] = value;
  }

  setAllInboxFilterQuery(query) {
    this.inboxFilterQuery = _.cloneDeep(query);
  }

  setAllDashboardFilterQuery(query) {
    this.dashboardFilterQuery = _.cloneDeep(query);
  }

  launchWorkflow(workflow: any): any {
    const url = `${global.base_url}WorkflowService/launchWorkflow`;
    return this.http.post(url, workflow);
  }
  getAutoSignUrl(empno, roleid, docid, witemid, initial, userType, refNo, dateString, memoId) {
    let urlone = global.esign_complete;
    const url = `${global.base_url}ESignService/prepareAutoESign?empno=${ie11_polyfill(empno)}&systime=${this.coreService.getSysTimeStamp()}&roleid=${ie11_polyfill(JSON.stringify(roleid))}&docid=${ie11_polyfill(docid)}&witemid=${ie11_polyfill(JSON.stringify(witemid))}&initial=${ie11_polyfill(initial)}&url=${ie11_polyfill(urlone)}&userType=${ie11_polyfill(userType)}&refNo=${ie11_polyfill(refNo)}&mdate=${ie11_polyfill(dateString)}&memoId=${ie11_polyfill(JSON.stringify(memoId))}`;
    return this.http.get(url);
  }

  launchBulkWorkflow(workflow: any): any {
    const url = `${global.base_url}WorkflowService/launchWorkflowBulk`;
    return this.http.post(url, workflow);
  }

  addUserWorkitem(workitem: any): any {
    const url = `${global.base_url}WorkflowService/addUserWorkitem`;
    return this.http.post(url, workitem, { responseType: 'text' });
  }

  finishWorkitem(id: any): any {
    const roleId = 0;
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/finishWorkitem?witmid=${ie11_polyfill(JSON.stringify(id))}&empNo=${ie11_polyfill(JSON.stringify(user.EmpNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  archiveWorkitem(id: any): any {
    const roleId = 0;
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/archiveWorkitem?witmid=${ie11_polyfill(JSON.stringify(id))}&empNo=${ie11_polyfill(JSON.stringify(user.EmpNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  undoFinishWorkitem(id: any): any {
    const roleId = 0;
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/undoFinishWorkitem?witmid=${ie11_polyfill(JSON.stringify(id))}&empNo=${ie11_polyfill(JSON.stringify(user.EmpNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  undoArchiveSentitem(id: any): any {
    const roleId = 0;
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/undoArchiveSentitem?sitmid=${ie11_polyfill(JSON.stringify(id))}&empNo=${ie11_polyfill(JSON.stringify(user.EmpNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  deleteDraft(draftId: any): any {
    const roleId = 0;
    const url = `${global.base_url}WorkflowService/deleteDraft?draftId=${draftId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  archiveSentitem(id: any): any {
    let roleId = 0;
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/archiveSentitem?sitmid=${ie11_polyfill(JSON.stringify(id))}&empNo=${ie11_polyfill(JSON.stringify(user.EmpNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  validateWorkitem(id: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/validateWorkitem?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  updateFlag(url, id): any {
    const user = this.us.getCurrentUser();
    url = url + '?witmid=' + ie11_polyfill(JSON.stringify(id)) + '&empNo=' + ie11_polyfill(JSON.stringify(user.EmpNo)) + '&sysdatetime=' + this.coreService.getSysTimeStamp();
    return this.http.get(`${global.base_url}${url}`, { responseType: 'text' });
  }


  validateSentItem(id: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/validateSentitem?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  forwardWorkflow(workitem: any): any {
    const url = `${global.base_url}WorkflowService/forwardWorkitem`;
    return this.http.post(url, workitem, { responseType: 'text' });
  }

  replyWorkflow(workitem: any): any {
    const url = `${global.base_url}WorkflowService/replyWorkitem`;
    return this.http.post(url, workitem, { responseType: 'text' });
  }

  replyAllWorkflow(workitem: any): any {
    const url = `${global.base_url}WorkflowService/replyAllWorkitem`;
    return this.http.post(url, workitem, { responseType: 'text' });
  }

  recallSentitem(id: any): any {
    const url = `${global.base_url}WorkflowService/recallSentItem?sitmid=${id}&empNo=${this.current_user.EmpNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  recallWorkitem(workItem: any): any {
    const url = `${global.base_url}WorkflowService/recallWorkitems`;
    return this.http.post(url, workItem, { responseType: 'text' });
  }

  readWorkitem(id: any): any {
    const url = `${global.base_url}WorkflowService/readWorkitem?witmid=${ie11_polyfill(JSON.stringify(id))}&empNo=${ie11_polyfill(JSON.stringify(this.current_user.EmpNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  

  getWorkflow(id: any): any {
    const url = `${global.base_url}WorkflowService/getWorkflow?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getWorkitem(id: any, empID: any, delNo = 0, isTask = 0): any {
    let witid = '';
    if ((typeof id === 'string')) {
      witid = id;
    }
    else {
      witid = JSON.stringify(id);
    }
    // console.log(typeof id);
    const url = `${global.base_url}WorkflowService/getWorkitemDetails?witmid=${ie11_polyfill(witid)}&empNo=${ie11_polyfill(JSON.stringify(empID))}&delNo=${ie11_polyfill(JSON.stringify(delNo))}&isTask=${ie11_polyfill(JSON.stringify(isTask))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    // const url = `${global.base_url}WorkflowService/getWorkitemDetails?witmid=${ie11_polyfill(witid)}&empNo=${ie11_polyfill(JSON.stringify(empID))}&delNo=${ie11_polyfill(JSON.stringify(delNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    // const url = `${global.base_url}WorkflowService/getWorkitemDetails?witmid=${witid}&empNo=${empID}&delNo=${delNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getWorkitemHistory(id: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/getWorkitemHistory?witmid=${ie11_polyfill(JSON.stringify(id))}&empNo=${ie11_polyfill(JSON.stringify(user.EmpNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getWorkflowTrack(wfId: any, type: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/getWorkflowTrack?wfid=${ie11_polyfill(JSON.stringify(wfId))}&empno=${ie11_polyfill(JSON.stringify(user.EmpNo))}&type=${ie11_polyfill(type)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getWorkflowAttachments(wfId: any): any {
    const url = `${global.base_url}WorkflowService/getWorkflowAttachments?wfid=${wfId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getWorkitemDetailsBySentItem(siId: any): any {
    const url = `${global.base_url}WorkflowService/getWorkitemDetailsBySentItem?sitemid=${siId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getUserInbox(empNo: any, pageNo: any, sort?: string, order?: string): any {
    let url = `${global.base_url}WorkflowService/getUserInbox?empNo=${ie11_polyfill(JSON.stringify(empNo))}&pageNo=${ie11_polyfill(JSON.stringify(pageNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    if (sort && order) {
      url = url + '&sort=' + ie11_polyfill(sort) + '&order=' + ie11_polyfill(order);
    }
    return this.http.get(url);
  }

  getDrafts(empNo: any, type: any): any {
    const url = `${global.base_url}WorkflowService/getDraftItems?userid=${ie11_polyfill(JSON.stringify(empNo))}&usertype=${ie11_polyfill(type)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getUserArchiveInbox(empNo: any, pageNo: any, sort?: string, order?: string): any {
    let url = `${global.base_url}WorkflowService/getUserArchiveInbox?empNo=${ie11_polyfill(JSON.stringify(empNo))}&pageNo=${ie11_polyfill(JSON.stringify(pageNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    if (sort && order) {
      url = url + '&sort=' + ie11_polyfill(sort) + '&order=' + ie11_polyfill(order);
    }
    return this.http.get(url);
  }

  getUserArchiveSentItems(empNo: any, pageNo: any, sort?: string, order?: string): any {
    let url = `${global.base_url}WorkflowService/getUserArchiveSentItems?empNo=${ie11_polyfill(JSON.stringify(empNo))}&pageNo=${ie11_polyfill(JSON.stringify(pageNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    if (sort && order) {
      url = url + '&sort=' + ie11_polyfill(sort) + '&order=' + ie11_polyfill(order);
    }
    return this.http.get(url);
  }

  getRoleArchiveInbox(role: any, empNo: any, pageNo: any, sort?: string, order?: string): any {
    let url = `${global.base_url}WorkflowService/getRoleArchiveInbox?roleId=${ie11_polyfill(JSON.stringify(role))}&empNo=${ie11_polyfill(JSON.stringify(empNo))}&pageNo=${ie11_polyfill(JSON.stringify(pageNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    if (sort && order) {
      url = url + '&sort=' + ie11_polyfill(sort) + '&order=' + ie11_polyfill(order);
    }
    return this.http.get(url);
  }

  getRoleArchiveSentItems(role: any, empNo: any, pageNo: any, sort?: string, order?: string): any {
    let url = `${global.base_url}WorkflowService/getRoleArchiveSentItems?roleId=${ie11_polyfill(JSON.stringify(role))}&empNo=${ie11_polyfill(JSON.stringify(empNo))}&pageNo=${ie11_polyfill(JSON.stringify(pageNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    if (sort && order) {
      url = url + '&sort=' + ie11_polyfill(sort) + '&order=' + ie11_polyfill(order);
    }
    return this.http.get(url);
  }

  getActions(empNo: any): any {
    const url = `${global.base_url}WorkflowService/getActions?empNo=${ie11_polyfill(JSON.stringify(empNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  // getUserWorkflows(empNo: any): any {
  //   const url = `${global.base_url}WorkflowService/getUserWorkflows?empNo=${empNo}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
  //   return this.http.get(url);
  // }

  getUserSentItems(empNo: any, pageNo: any, sort?: string, order?: string): any {
    let url = `${global.base_url}WorkflowService/getUserSentItems?empNo=${ie11_polyfill(JSON.stringify(empNo))}&pageNo=${ie11_polyfill(JSON.stringify(pageNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    if (sort && order) {
      url = url + '&sort=' + ie11_polyfill(sort) + '&order=' + ie11_polyfill(order);
    }
    return this.http.get(url);
  }

  getWorkitemStats(Id: any, userType: any, reportType: any, itemType: any, workitemType): any {
    const url = `${global.base_url}WorkflowService/getWorkitemStats?userId=${ie11_polyfill(JSON.stringify(Id))}&userType=${ie11_polyfill(userType)}&reportType=${ie11_polyfill(reportType)}&itemType=${ie11_polyfill(itemType)}&dType=${ie11_polyfill(workitemType)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getSentItemsWorkitems(wiID: any, empNo: any, status: any): any {
    const url = `${global.base_url}WorkflowService/getSentItemWorkItems?witmid=${ie11_polyfill(JSON.stringify(wiID))}&empNo=${ie11_polyfill(JSON.stringify(empNo))}&status=${ie11_polyfill(status)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getRoleSentItems(roleId: any, empNo: any, pageNo: any, sort?: any, order?: any): any {
    let url = `${global.base_url}WorkflowService/getRoleSentItems?roleId=${ie11_polyfill(JSON.stringify(roleId))}&empNo=${ie11_polyfill(JSON.stringify(empNo))}&pageNo=${ie11_polyfill(JSON.stringify(pageNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    if (sort && order) {
      url = url + '&sort=' + ie11_polyfill(sort) + '&order=' + ie11_polyfill(order);
    }
    return this.http.get(url);
  }

  getRoleInbox(roleId: any, empNo: any, pageNo: any, sort?: string, order?: string): any {
    let url = `${global.base_url}WorkflowService/getRoleInbox?empNo=${ie11_polyfill(JSON.stringify(empNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&pageNo=${ie11_polyfill(JSON.stringify(pageNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    if (sort && order) {
      url = url + '&sort=' + ie11_polyfill(sort) + '&order=' + ie11_polyfill(order);
    }
    return this.http.get(url);
  }

  getSearchTemplateDocuments(search: any): any {
    const url = `${global.base_url}WorkflowService/getSearchTemplateDocuments`;
    return this.http.post(url, search);
  }

  searchInbox(query: any): any {
    // query=ie11_polyfill(JSON.stringify(query));
    const url = `${global.base_url}WorkflowService/searchInbox`;
    return this.http.post(url, query);
  }

  _getTabLabelAndIndex() {
    const user = this.us.getCurrentUser();
    let tabLabel, tabIndex;
    if (this.breadcrumbService.dashboardFilterQuery && this.breadcrumbService.dashboardFilterQuery.filterStatus !== 'Actioned') {
      const id = this.breadcrumbService.dashboardFilterQuery.filterUserId;
      this.dashboardFilterQuery[id] = this.breadcrumbService.dashboardFilterQuery;

      tabLabel = this.breadcrumbService.dashboardFilterQuery.filterUserName;
      tabIndex = this.breadcrumbService.dashboardFilterQuery.filterActiveTabIndex;
    } else {
      if (this.inboxSelectedUserTab) {
        tabLabel = this.inboxSelectedUserTab.split('@')[1];
        tabIndex = this.inboxSelectedUserTab.split('@')[0];
      } else {
        if (user.roles.length > 0) {
          tabLabel = user.roles[0].name;
          tabIndex = 1;
        } else {
          tabLabel = user.fulName;
          tabIndex = 0;
        }
      }
    }
    //console.log('label = ', tabLabel);
    //console.log('index = ', tabIndex);
    return {
      label: tabLabel,
      index: tabIndex
    }
  }

  private _setAdditionalRequestBodyData(query, pageFrom) {
    const user = this.us.getCurrentUser();
    let tabLabelIndex = this._getTabLabelAndIndex();

    query.repStatus = 'active';
    let breakLoop = false;
    for (const role of user.roles) {
      if (role.name === tabLabelIndex.label) {
        query.userType = 'ROLE';
        query.userId = role.id;
        query.empNo = user.EmpNo;
        query.recipientName = undefined;
        this.delegateId = undefined;
        this.delegateEmpNo = undefined;
        breakLoop = true;
        break;
      }
    }
    if (!breakLoop) {
      for (const delegate of user.delegated) {
        if (delegate.delName === tabLabelIndex.label) {
          query.userType = 'USER';
          query.userId = delegate.userId;
          query.recipientName = undefined; //'USER:' + delegate.userId;
          query.empNo = user.EmpNo;

          //TODO: check delegation popup to show when user go to tab
          /*this.us.validateDelegation(delegate.id).subscribe(res => {
            if (res === 'INACTIVE') {
              this.showDelegationInactiveDialog = true;
            }
          });*/
          this.delegateId = delegate.id;
          this.delegateEmpNo = delegate.userId;
          breakLoop = true;
          break;
        }
      }
      if (!breakLoop) {
        if (user.fulName === tabLabelIndex.label) {
          query.userType = 'USER';
          query.userId = user.EmpNo;
          query.recipientName = undefined; //'USER:' + user.EmpNo;
          query.empNo = user.EmpNo;
          this.delegateId = undefined;
          this.delegateEmpNo = undefined;
        }
      }
    }

    return query;
  }

  createRequestBody(params) {
    let maxDate = new Date(),
      filterQuery = {};
    if (params.pageFrom === 'dashboard') {
      if (params.filterStatus === 'Read') {
        filterQuery['status'] = 'Read';
      } else if (params.filterStatus === 'Unread') {
        filterQuery['status'] = 'New';
      } else if (params.filterStatus === 'Pending') {
        filterQuery['sysStatus'] = 'Read';
      } else if (params.filterStatus === 'New') {
        filterQuery['sysStatus'] = 'New';
      }
      if (params.filterReceivedDay === 'Today') {
        filterQuery['receivedDate'] = maxDate.getDate() + '/' + (maxDate.getMonth() + 1) + '/' + maxDate.getFullYear();
      } else if (params.filterReceivedDay === 'Total') {
        filterQuery['receivedDate'] = '';
      } else if (params.filterReceivedDay === 'deadline') {
        filterQuery['status'] = 'overdue';
      }

      if (filterQuery['status'] === 'Forward') {
        filterQuery['actionId'] = 1;
      } else {
        filterQuery['actionId'] = 0;
      }
      if (filterQuery['status'] === 'overdue') {
        filterQuery['deadline'] = maxDate.getDate() + '/' + (maxDate.getMonth() + 1) + '/' + maxDate.getFullYear();
      }

      filterQuery['type'] = params.filterWIType;
    }
    return filterQuery;
  }

  searchInboxNew(query?): any {
    query = query || { pageNo: 1, sort: 'createdDate', order: 'DESC', repStatus: "active" };
    query = this._setAdditionalRequestBodyData(query, 'inbox');
    //query=ie11_polyfill(JSON.stringify(query));
    const url = `${global.base_url}WorkflowService/searchInbox`;
    return this.http.post(url, query);
  }

  exportInbox(query: any): any {
    //query=ie11_polyfill(JSON.stringify(query));
    const url = `${global.base_url}WorkflowService/exportInbox`;
    return this.http.post(url, query, { responseType: "blob" });
  }

  searchSentItems(query: any): any {
    //query=ie11_polyfill(JSON.stringify(query));
    const url = `${global.base_url}WorkflowService/searchSentItems`;
    return this.http.post(url, query);
  }

  searchActionedItems(query: any): any {
    //query=ie11_polyfill(JSON.stringify(query));
    const url = `${global.base_url}WorkflowService/searchActionedItems`;
    return this.http.post(url, query);
  }

  exportSent(query: any): any {
    //query=ie11_polyfill(JSON.stringify(query));
    const url = `${global.base_url}WorkflowService/exportSentItems`;
    return this.http.post(url, query, { responseType: "blob" });
  }

  exportActioned(query: any): any {
    //query=ie11_polyfill(JSON.stringify(query));
    const url = `${global.base_url}WorkflowService/exportActioned`;
    return this.http.post(url, query, { responseType: "blob" });
  }

  getInboxFilterUsers(userid: any, usertype: any, status: any): any {
    const url = `${global.base_url}WorkflowService/getInboxFilterUsers?userid=${ie11_polyfill(JSON.stringify(userid))}&usertype=${ie11_polyfill(usertype)}&status=${ie11_polyfill(status)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getSentitemFilterUsers(userid: any, usertype: any, status: any): any {
    const url = `${global.base_url}WorkflowService/getSentitemFilterUsers?userid=${ie11_polyfill(JSON.stringify(userid))}&usertype=${ie11_polyfill(usertype)}&status=${ie11_polyfill(status)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  finishWorkitemBefore(empNo: any, roleId: any, bDate: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/finishWorkitemBefore?empNo=${ie11_polyfill(JSON.stringify(empNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&bDate=${ie11_polyfill(bDate)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  archiveWorkitemBefore(empNo: any, roleId: any, bDate: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/archiveWorkitemBefore?empNo=${ie11_polyfill(JSON.stringify(empNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&bDate=${ie11_polyfill(bDate)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  archiveSentitemBefore(empNo: any, roleId: any, bDate: any): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/archiveSentitemBefore?empNo=${ie11_polyfill(JSON.stringify(empNo))}&roleId=${ie11_polyfill(JSON.stringify(roleId))}&bDate=${ie11_polyfill(bDate)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  getWorkitemProgress(workitemId): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/getWorkitemProgress?witmid=${workitemId}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getUserNewWorkitems(): any {
    const user = this.us.getCurrentUser();
    const url = `${global.base_url}WorkflowService/getUserNewWorkitems?empNo=${ie11_polyfill(JSON.stringify(user.EmpNo))}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  removeWorkitemProgress(id): any {
    const url = `${global.base_url}WorkflowService/removeWorkitemProgress?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url, { responseType: 'text' });
  }

  addWorkitemProgress(message: string, empNo: any, workitemId: any): any {
    const sysDateTime = new Date();
    let postdata = ie11_polyfill(JSON.stringify({ message: message, empNo: empNo, workitemId: workitemId }));
    const url = `${global.base_url}WorkflowService/saveWorkitemProgress`;
    return this.http.post(url, postdata, { responseType: 'text' });
  }

  addSecurityForDelegate(query) {
    const url = `${global.report_url}WorkflowService/addDelegatedUser`;
    return this.http.post(url, query, { responseType: 'text' });
  }

  addMissingPermissions(query) {
    const url = `${global.report_url}WorkflowService/addMissingPermissions`;
    return this.http.post(url, query, { responseType: 'text' });
  }

  getTokenUrl(empno, roleid, docid, witemid, initial) {
    let urlone = global.esign_complete;
    const url = `${global.base_url}ESignService/prepareESign?empno=${ie11_polyfill(empno)}&systime=${this.coreService.getSysTimeStamp()}&roleid=${ie11_polyfill(JSON.stringify(roleid))}&docid=${ie11_polyfill(docid)}&witemid=${ie11_polyfill(JSON.stringify(witemid))}&initial=${ie11_polyfill(initial)}&url=${ie11_polyfill(urlone)}`;
    return this.http.get(url);
  }

  getNewTokenUrl(empno, roleid, docid, witemid, initial) {
    let urlone = global.esign_New_complete;
    const url = `${global.base_url}ESignService/prepareNewESign?empno=${ie11_polyfill(empno)}&systime=${this.coreService.getSysTimeStamp()}&roleid=${ie11_polyfill(JSON.stringify(roleid))}&docid=${ie11_polyfill(docid)}&witemid=${ie11_polyfill(JSON.stringify(witemid))}&initial=${ie11_polyfill(initial)}&url=${urlone}`;
    return this.http.get(url);
  }
  updateInboxCount() {
    const user = this.us.getCurrentUser();
    this.getUserNewWorkitems().subscribe(
      data => {
        this.inboxMenu.badge = data.totalCount;
      });
  }

  updateDraftsCount() {
    const user = this.us.getCurrentUser();
    this.getDrafts(user.EmpNo, 'USER').subscribe(data => {
      this.draftMenu.badge = data.length;
    });
  }
  multiSignDocument(empno, docid, witemid, roleid) {
    const url = `${global.base_url}ESignService/multiSignDocument?empno=${ie11_polyfill(empno)}&roleid=${ie11_polyfill(JSON.stringify(roleid))}&xPos=${global.sign_xPos}&yPos=${global.sign_yPos}&systime=${this.coreService.getSysTimeStamp()}&docid=${ie11_polyfill(docid)}&witemid=${ie11_polyfill(JSON.stringify(witemid))}`;
    return this.http.get(url, { responseType: 'text' });
  }
  /**
   * @description Get the counter for all tabs
   * @param userId
   * @param page
   */
  getTabsCounter(userId, page): any {
    let url;
    let value = { active: 'active', finish: 'finish', archive: 'archive' };
    if (page === 'inbox') {
      url = `${global.base_url}WorkflowService/getInboxCount?empNo=${ie11_polyfill(JSON.stringify(userId))}&status=${ie11_polyfill(value.active)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
      return this.http.get(url);
    } else if (page === 'sent') {
      url = `${global.base_url}WorkflowService/getSentItemsCount?empNo=${ie11_polyfill(JSON.stringify(userId))}&status=${ie11_polyfill(value.active)}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
      return this.http.get(url);
    } else if (page === 'archive') {
      url = {
        inbox: `${global.base_url}WorkflowService/getInboxCount?empNo=${ie11_polyfill(JSON.stringify(userId))}&status=${ie11_polyfill(value.finish)}&sysdatetime=${this.coreService.getSysTimeStamp()}`,
        sent: `${global.base_url}WorkflowService/getSentItemsCount?empNo=${ie11_polyfill(JSON.stringify(userId))}&status=${ie11_polyfill(value.archive)}&sysdatetime=${this.coreService.getSysTimeStamp()}`
      };
      //TODO: When RXJS will be upgraded to v6 or higher, use import {forkJoin} from 'rxjs'; and change Observable.forkJoin to forkJoin only
      return forkJoin([
        this.http.get(url.inbox),
        this.http.get(url.sent),
      ])
    }
  }

  loadWorkflowActions(cb?) {
    let empNO;
    if (this.current_user && this.current_user.EmpNo) {
      empNO = this.current_user.EmpNo;
    }
    else {
      empNO = this.us.getCurrentUser();
    }
    this.getActions(empNO).subscribe(res => {
      this.workflowActions = res;
      if (cb)
        cb();
    });
  }

  getWorkflowActions() {
    if (this.workflowActions) {
      return this.workflowActions;
    } else {
      this.loadWorkflowActions(() => {
        return this.workflowActions;
      });
    }
  }

}