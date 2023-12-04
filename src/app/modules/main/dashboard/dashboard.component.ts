import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
// services
import { WorkflowService } from '../../../services/workflow.service';
import { NewsService } from '../../../services/news.service';
import { UserService } from '../../../services/user.service';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
// models
import { User } from '../../../models/user/user.model';
// libraries
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import * as globalv from "../../../global.variables";
import { CoreService } from "../../../services/core.service";
import { BrowserEvents } from '../../../services/browser-events.service';
import {AdminService} from "../../../services/admin.service";
import { ChartOptions } from 'chart.js';

@Component({
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {


  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartDatasets:any = [ {
    data: [ 20, 17, 3 ]
  } ];
  public pieChartLegend = true;
  // public pieChartPlugins = [];


  events: any[];
  username: any;
  types: SelectItem[];
  dueTypes: SelectItem[];
  dueWorkitemTypes: SelectItem[];
  public newsItems: any;
  public user = new User();
  public currentUser: any = {};
  public selectedTabIndex: number = 0;
  public tabIndex: number = 0;
  public busy: boolean = true;
  private subscriptions: any[] = [];
  public dashboardStatistics: any = [];
  public showDelegationInactiveDialog = false;
  userSetting = [];
  public chartLabels = ['Read', 'Actioned', 'Unread'];
  public ChartColors = [
    {
      backgroundColor: ['#FFC107', '#03A9F4', '#4CAF50'],
      pointBackgroundColor: ['#FFE082', '#81D4FA', '#A5D6A7'],
    }
  ];
  public dueChartLabels = ['Pending', 'New'];
  public dueChartColors = [
    {
      backgroundColor: ['#009999', '#90A4AE'],
      pointBackgroundColor: ['#80CBC4', '#90A4ff'],
    }
  ];
  public chartOptions: any = {
    /*pieceLabel: {
      render: function (args) {
        const value = args.value;
        return value;
      },
      fontSize: 14,
      fontStyle: 'bold',
      fontColor: '#fff',
      fontFamily: '"Lucida Console", Monaco, monospace'
    },*/
  
      resposive:true,
      maintainAspectRatio: false,
   
    plugins: {
     
      datalabels: {
        align: 'center',
        anchor: 'center',
        backgroundColor: null,
        borderColor: null,
        borderRadius: 4,
        borderWidth: 1,
        color: '#FFFFFF',
        font: {
          size: 12,
          weight: 500
        },
        offset: 4,
        padding: 0,
        formatter: function (value) {
          return value
        }
      }
    },
    legend: {
      onHover: function (e) {
        e.target.style.cursor = 'pointer';
      }
    },
    hover: {
      onHover: function (e) {
        const point = this.getElementAtEvent(e);
        if (point.length) {
          e.target.style.cursor = 'pointer';
        } else {
          e.target.style.cursor = 'default';
        }
      }
    }
  };

  constructor(private breadcrumbService: BreadcrumbService, public workflowService: WorkflowService,
    private ns: NewsService, private us: UserService, private router: Router,
    private coreService: CoreService, private bs: BrowserEvents,private as: AdminService) {
  }

  ngOnInit() {
     //window.open('microsoft-edge:'+document.URL);
     //window.open('ie:'+document.URL,'_blank');
    // navigate to previous page on reload
    let sentSelectedUserTab = localStorage.getItem('sentSelectedUserTab');
    let navigateToDraft = localStorage.getItem('navigateToDraft');
    let pageClickRefresh = localStorage.getItem('pageRefresh');


    if (sentSelectedUserTab) {
      this.workflowService.sentSelectedUserTab = sentSelectedUserTab;
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      localStorage.removeItem('pageRefresh');
      this.bs.sentRefreshRequired.emit('sent-feature');
      this.router.navigate(['/workflow/sent']);
      window.parent.postMessage('goToSentAfterLaunchReload', '*');
    }
    else if (navigateToDraft) {
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      localStorage.removeItem('pageRefresh');
      this.router.navigate(['/workflow/draft']);
      window.parent.postMessage('goToDraftAfterLaunchReload', '*');
    }
    else if (pageClickRefresh) {
      localStorage.removeItem('sentSelectedUserTab');
      localStorage.removeItem('navigateToDraft');
      localStorage.removeItem('pageRefresh');
      this.router.navigate([this.getNavigationUrl(pageClickRefresh)]);
      window.parent.postMessage(pageClickRefresh + ':AfterReload', '*');
    }
    else {
      this.breadcrumbService.setItems([
        { label: 'Dashboard' },
        // {label: 'Dashboard', routerLink: ['/']}
      ]);
      this.username = globalv.username;
      this.busy = true;
      this.us.logIn(this.username, 'def').subscribe(data => {
        this.busy = false;
        localStorage.setItem('user', JSON.stringify(data));
        this.currentUser = this.us.getCurrentUser();
        this.getUserStat(this.currentUser.EmpNo);
        this.getUserSetting();
        this.dashboardStatistics[this.currentUser.EmpNo] = {
          today: {
            all: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: true },
            to: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
            cc: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
            selectedType: 'all'
          },
          total: {
            all: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: true },
            to: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
            cc: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
            selectedType: 'all'
          },
          deadline: {
            inbox: {
              dueToday: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: true },
              overDue: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: false },
              active: true
            }, sent: {
              dueToday: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: true },
              overDue: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: false },
              active: false
            },
            selectedType: 'dueToday', selectedWorkitemType: 'inbox'
          }
        };
        if (this.currentUser.roles.length > 0) {
          this.currentUser.roles.map((role, index) => {
            this.dashboardStatistics[role.id] = {
              today: {
                all: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: true },
                to: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
                cc: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
                selectedType: 'all'
              },
              total: {
                all: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: true },
                to: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
                cc: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
                selectedType: 'all'
              },
              deadline: {
                inbox: {
                  dueToday: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: true },
                  overDue: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: false },
                  active: true
                }, sent: {
                  dueToday: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: true },
                  overDue: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: false },
                  active: false
                },
                selectedType: 'dueToday', selectedWorkitemType: 'inbox'
              }
            };
          })
        }
        if (this.currentUser.delegated.length > 0) {
          this.currentUser.delegated.map((del, index) => {
            this.dashboardStatistics[del.userId] = {
              today: {
                all: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: true },
                to: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
                cc: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
                selectedType: 'all'
              },
              total: {
                all: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: true },
                to: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
                cc: { read: 0, unread: 0, actioned: 0, total: 0, chartData: [{data:[0,0,0]}], active: false },
                selectedType: 'all'
              },
              deadline: {
                inbox: {
                  dueToday: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: true },
                  overDue: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: false },
                  active: true
                }, sent: {
                  dueToday: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: true },
                  overDue: { read: 0, unread: 0, total: 0, chartData: [{data:[0,0]}], active: false },
                  active: false
                },
                selectedType: 'dueToday', selectedWorkitemType: 'inbox'
              }
            };
          })
        }

        if (this.currentUser.roles.length > 0) {
        } else {
         this.getUserStat(this.currentUser.EmpNo);
        }
        this.ns.getNews(this.currentUser.EmpNo).subscribe(res => {
          this.newsItems = res;
        });
      }, Error => {
        this.busy = false;
        localStorage.removeItem('user');
        this.router.navigate(['/auth/auth-failure'])
      });
      this.types = [{ label: 'All', value: 'all' }, { label: 'To', value: 'to' }, { label: 'CC', value: 'cc' }];
      this.dueTypes = [{ label: 'Due Today', value: 'dueToday' }, { label: 'Overdue', value: 'overDue' }];
      this.dueWorkitemTypes = [{ label: 'Inbox', value: 'inbox' }, { label: 'Sent', value: 'sent' }];
    }

 
     if(this.as.designationValues && this.as.designationValues!=null && this.as.designationValues.length<=0){
       //AKV-getDesignationValues
       this.as.getDesignationData().subscribe(data => {
         if(data){
          this.as.designationValues=data;
          this.as.designationValues.unshift({ id: "", value: null, action: "" });
         }
    },err=>{
       })
    }
  }


  activateSelectedTab(selectedTab) {
    if (this.currentUser.EmpNo == selectedTab) {
      this.selectedTabIndex = 0;
    } else if (this.currentUser.roles) {
      if (this.currentUser.roles.length > 0) {
        for (let i = 0; i < this.currentUser.roles.length; i++) {
          if (this.currentUser.roles[i].id == selectedTab) {
            this.selectedTabIndex = i + 1
            break;
          }
          if (i == this.currentUser.roles.length - 1) {
            if (this.currentUser.delegated && this.currentUser.delegated.length > 0) {
              for (let j = 0; j < this.currentUser.delegated.length; j++) {
                if (this.currentUser.delegated[j].id == selectedTab) {
                  this.selectedTabIndex = (this.currentUser.roles.length + 1) + j;
                }
              }
            } else if (this.currentUser) {
              this.selectedTabIndex = 0
            }
          }
        }
      } else {
        if (this.currentUser.delegated && this.currentUser.delegated.length > 0) {
          for (let j = 0; j < this.currentUser.delegated.length; j++) {
            if (this.currentUser.delegated[j].id == selectedTab) {
              this.selectedTabIndex = (this.currentUser.roles.length + 1) + j;
            }
          }
        } else if (this.currentUser) {
          this.selectedTabIndex = 0
        }
      }

    }
  }
  
  getUserSetting(){
    this.us.getUserSettings().subscribe(async result => {
      this.userSetting = result;

    for(let i = 0; i< this.userSetting.length ;i++){
      if(this.userSetting[i].key == 'Default Tab'){
        if (this.userSetting[i].val == '' && this.user.roles.length > 0) {
          this.selectedTabIndex =  1;
        } else if(this.userSetting[i].val != ''){
          this.activateSelectedTab(Number(this.userSetting[i].val))
        } else if (this.user) {
          this.selectedTabIndex = 0
        }
        break;
      }
    }
    });
  }

  goToInbox(isDashboardFilter) {
    this.bs.inboxRefreshRequired.emit(isDashboardFilter ? 'dashboard-filter' : 'inbox-from-dashboard');
    this.router.navigate(['/workflow/inbox']);
    window.parent.postMessage('GoToInbox', '*');
  }

  goToInboxNew(dashboardFilter) {
    if (dashboardFilter) {
      this.router.navigate(['/workflow/inbox-new', {
        filterStatus: dashboardFilter.filterStatus,
        filterReceivedDay: dashboardFilter.filterReceivedDay,
        filterWIType: dashboardFilter.filterWIType,
        filterUserId: dashboardFilter.filterUserId,
        pageFrom: 'dashboard'
      }
      ]);
    } else {
      this.router.navigate(['/workflow/inbox-new']);
    }
    window.parent.postMessage('GoToInbox', '*');
  }

  goToActioned() {
    this.bs.actionedRefreshRequired.emit('dashboard-filter');
    //this.workflowService.filterResultsTab = [];
    this.router.navigate(['/workflow/actioned']);
    window.parent.postMessage('GoToActioned', '*');
  }

  goToSent(isDashboardFilter) {
    this.bs.sentRefreshRequired.emit(isDashboardFilter ? 'dashboard-filter' : 'sent-from-dashboard');
    this.router.navigate(['/workflow/sent']);
    window.parent.postMessage('GoToSent', '*');
  }

  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'refreshDash') {
      if (this.currentUser.roles && this.currentUser.roles.length > 0) {
        this.tabChange(this.currentUser.roles[0].name, 1);
      } else {
        this.tabChange(this.currentUser.fullName, 0);
      }

    }
  }

  changeActiveView(type?: any, id?, view?, selectedWorkitemType?) {
    // console.log(type, id, view, selectedWorkitemType,"type, id, view, selectedWorkitemType");
    
    if (type === 'dueToday' || type === 'overDue') {
      this.changeDeadlineToInactiveView(id, view);
    } else {
      this.changeToInactiveView(id, view);
    }
    switch (type) {
      case 'all':
        this.dashboardStatistics[id][view].all.active = true;
        break;
      case 'to':
        this.dashboardStatistics[id][view].to.active = true;
        break;
      case 'cc':
        this.dashboardStatistics[id][view].cc.active = true;
        break;
      case 'dueToday':
        this.dashboardStatistics[id][view].inbox.dueToday.active = true;
        this.dashboardStatistics[id][view].sent.dueToday.active = true;
        break;
      case 'overDue':
        this.dashboardStatistics[id][view].inbox.overDue.active = true;
        this.dashboardStatistics[id][view].sent.overDue.active = true;
        break;
    }
  }

  changeToInactiveView(id, view) {
    this.dashboardStatistics[id][view].all.active = false;
    this.dashboardStatistics[id][view].to.active = false;
    this.dashboardStatistics[id][view].cc.active = false;
  }

  changeDeadlineToInactiveView(id, view) {
    this.dashboardStatistics[id][view].inbox.dueToday.active = false;
    this.dashboardStatistics[id][view].inbox.overDue.active = false;
    this.dashboardStatistics[id][view].sent.dueToday.active = false;
    this.dashboardStatistics[id][view].sent.overDue.active = false;
  }

  changeActiveWorkitemView(type: any, id) {
    // console.log(type,id,"type,id");
    // console.log(this.dashboardStatistics[this.currentUser.EmpNo].deadline[this.dashboardStatistics[this.currentUser.EmpNo].deadline.selectedWorkitemType].overDue.chartData);
    // console.log(this.dashboardStatistics[this.currentUser.EmpNo].deadline[this.dashboardStatistics[this.currentUser.EmpNo].deadline.selectedWorkitemType].dueToday.active);
    
    
    
    this.dashboardStatistics[id].deadline.inbox.active = false;
    this.dashboardStatistics[id].deadline.sent.active = false;
    switch (type) {
      case 'inbox':
        this.dashboardStatistics[id].deadline.inbox.active = true;
        break;
      case 'sent':
        this.dashboardStatistics[id].deadline.sent.active = true;
        break;
    }
  }

  onSelect(event?: any, userType?: any, userName?: any, id?: any, day?: any, WIType?: any, dueWorkitemTypes?,type?) {
    // console.log(event);
    
    
    let label;
    if (event.active && event.active.length > 0&&type=='Due') {
      const chartElement = event.active[0];
      label = this.dueChartLabels[chartElement.index];
      console.log(`Selected Label: ${label}`);
    }else{
      const chartElement = event.active[0];
      label = this.chartLabels[chartElement.index];
      console.log(`Selected Label: ${label}`);
    }
    if (WIType !== undefined && userType !== undefined
      && userName !== undefined && id !== undefined
      && day !== undefined && label !== undefined) {
      this.breadcrumbService.fromDashboard = true;
      const dashboardFilter = {
        'filterUserType': ' ', 'filterUserName': ' ',
        'filterUserId': ' ', 'filterWIType': '',
        'filterStatus': '', 'filterReceivedDay': '', 'filterActiveTabIndex': 0
      };
      dashboardFilter.filterUserType = userType;
      dashboardFilter.filterUserName = userName;
      dashboardFilter.filterUserId = id;
      dashboardFilter.filterWIType = WIType;
      dashboardFilter.filterStatus = label;
      dashboardFilter.filterReceivedDay = day;
      dashboardFilter.filterActiveTabIndex = this.selectedTabIndex;
      //this.breadcrumbService.dashboardFilterQuery = dashboardFilter;
      if (label === 'Actioned') {
        this.breadcrumbService.actionedDashboardFilterQuery = dashboardFilter;
        this.goToActioned();
      } else if (dueWorkitemTypes === 'sent') {
        this.breadcrumbService.sentDashboardFilterQuery = dashboardFilter;
        this.goToSent(true);
      } else {
        this.breadcrumbService.dashboardFilterQuery = dashboardFilter;
        this.goToInbox(true);
        //this.goToInboxNew(dashboardFilter);
      }
    }
  }

  getUserStat(id) {
    this.getWorkitemStatistics(id, 'USER', 'today');
    this.getWorkitemStatistics(id, 'USER', 'total');
    this.getWorkitemDeadlineStatistics(id, 'USER', 'inbox', 'overDue');
    this.getWorkitemDeadlineStatistics(id, 'USER', 'inbox', 'dueToday');
    this.getWorkitemDeadlineStatistics(id, 'USER', 'sent', 'overDue');
    this.getWorkitemDeadlineStatistics(id, 'USER', 'sent', 'dueToday');
  }

  getDelegateStat(id) {
    this.getWorkitemStatistics(id, 'USER', 'today');
    this.getWorkitemStatistics(id, 'USER', 'total');
    this.getWorkitemDeadlineStatistics(id, 'USER', 'inbox', 'overDue');
    this.getWorkitemDeadlineStatistics(id, 'USER', 'inbox', 'dueToday');
    this.getWorkitemDeadlineStatistics(id, 'USER', 'sent', 'overDue');
    this.getWorkitemDeadlineStatistics(id, 'USER', 'sent', 'dueToday');
  }

  getRoleStat(id) {
    this.getWorkitemStatistics(id, 'ROLE', 'today');
    this.getWorkitemStatistics(id, 'ROLE', 'total');
    this.getWorkitemDeadlineStatistics(id, 'ROLE', 'inbox', 'overDue');
    this.getWorkitemDeadlineStatistics(id, 'ROLE', 'inbox', 'dueToday');
    this.getWorkitemDeadlineStatistics(id, 'ROLE', 'sent', 'overDue');
    this.getWorkitemDeadlineStatistics(id, 'ROLE', 'sent', 'dueToday');
  }

  getWorkitemStatistics(id, userType, view) {
    let itemTypeList = ['all', 'to', 'cc'];
    this.busy = true;
    this.workflowService.getWorkitemStats(id, userType, view.toUpperCase(), '', 'inbox').subscribe(data => {
      this.busy = false;
      data.map((stat, i) => {
        this.dashboardStatistics[id][view][itemTypeList[i]].chartData[0].data = [];
        this.dashboardStatistics[id][view][itemTypeList[i]].unread = stat.unread;
        this.dashboardStatistics[id][view][itemTypeList[i]].actioned = stat.reply;
        this.dashboardStatistics[id][view][itemTypeList[i]].read = stat.read;
        this.dashboardStatistics[id][view][itemTypeList[i]].total = stat.total;
        if (stat.read > 0) {
          this.dashboardStatistics[id][view][itemTypeList[i]].chartData[0].data.push(stat.read);
        } else {
          this.dashboardStatistics[id][view][itemTypeList[i]].chartData[0].data.push('');
        }
        if (stat.reply > 0 || stat.forward > 0) {
          let actioned = stat.reply + stat.forward;
          this.dashboardStatistics[id][view][itemTypeList[i]].chartData[0].data.push(actioned);
        } else {
          this.dashboardStatistics[id][view][itemTypeList[i]].chartData[0].data.push('');
        }
        if (stat.unread > 0) {
          this.dashboardStatistics[id][view][itemTypeList[i]].chartData[0].data.push(stat.unread);
        } else {
          this.dashboardStatistics[id][view][itemTypeList[i]].chartData[0].data.push('');
        }
      });
      
    }, Error => {
      this.busy = false;
    });
  }

  getWorkitemDeadlineStatistics(id, userType, workitemType, itemType) {
    // console.log(id, userType, workitemType, itemType);
    
    this.busy = true;
    this.workflowService.getWorkitemStats(id, userType, 'DEADLINE', itemType, workitemType).subscribe(data => {
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",data[0].read);
      
      this.busy = false;
      if (data && data[0]) {
        this.dashboardStatistics[id].deadline[workitemType][itemType].chartData[0].data = [];
        this.dashboardStatistics[id].deadline[workitemType][itemType].read = data[0].read;
        this.dashboardStatistics[id].deadline[workitemType][itemType].unread = data[0].unread;
        this.dashboardStatistics[id].deadline[workitemType][itemType].total = data[0].total;
        if (data[0].read > 0) {
          if (workitemType=='inbox') {
            this.dashboardStatistics[id].deadline[workitemType][itemType]?.chartData[0]?.data?.push(data[0].read);
            this.dashboardStatistics[id].deadline[workitemType][itemType]?.chartData[1]?.data?.push(0);
          }else{
            this.dashboardStatistics[id].deadline[workitemType][itemType].chartData[0].data?.push(data[0].read);
          }
        } else {
          this.dashboardStatistics[id].deadline[workitemType][itemType].chartData?.push('');
        }
        if (data[0].unread > 0) {
          this.dashboardStatistics[id].deadline[workitemType][itemType].chartData[0]?.data?.push(data[0].unread);
        } else {
          this.dashboardStatistics[id].deadline[workitemType][itemType].chartData.push('');
        }        
        // console.log(this.dashboardStatistics);
        
      }
    }, Error => {
      this.busy = false;
    });
  }

  tabChange(textLabel, index) {
    console.log("textLabel, index",textLabel, index);
    
    // this.currentUser = this.us.getCurrentUser();
    // console.log(this.currentUser);
    
    this.selectedTabIndex = index;
    this.breadcrumbService.dashboardTabSelected = this.selectedTabIndex + '@' + textLabel;
    let type;
    let id;
    for (const role of this.currentUser.roles) {
      if (textLabel === role.name) {
        type = 'role';
        id = role.id;
      }
    }
    if (type === undefined) {
      for (const del of this.currentUser.delegated) {
        if (textLabel === del.delName) {
          type = 'del';
          id = del.userId;

          this.us.validateDelegation(del.id).subscribe(res => {
            if (res === 'INACTIVE') {
              this.showDelegationInactiveDialog = true;
            }
          });
          this.workflowService.delegateId = del.id;
        }
      }
    }
    if (type === undefined) {
      if (textLabel === this.currentUser.fulName) {
        type = 'user';
        id = this.currentUser.EmpNo;
      }
    }
    if (type === 'role') {
      this.getRoleStat(id);
    } else if (type === 'del') {
      this.getDelegateStat(id);
    } else if (type === 'user') {
      this.getUserStat(id);
    }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
    this.destroyKeys();
  }

  reloadApp() {
    this.showDelegationInactiveDialog = false;
    window.location.reload();
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      this[k] = null;
      //  delete this[k];
    })
  }

  getNavigationUrl(page) {
    switch (page) {
      case 'LoadDashboard': {
        return '/';
      }
      case 'navigateToFav': {
        return '/favourites';
      }
      case 'navigateToRec': {
        return '/recents';
      }
      case 'navigateToTeam': {
        return '/teamshared';
      }
      case 'navigateToSettings': {
        return '/settings';
      }
      case 'navigateToDash': {
        return '/';
      }
      case 'navigateToLaunch': {
        return '/workflow/launch';
      }
      case 'navigateToInbox': {
        return '/workflow/inbox';
      }
      case 'navigateToSent': {
        return '/workflow/sent';
      }
      case 'navigateToDraft': {
        return '/workflow/draft';
      }
      case 'navigateToArchive': {
        return '/workflow/archive';
      }
      case 'navigateToShortCuts': {
        return '/shortcuts';
      }
      case 'navigateToHelp': {
        return '/help';
      }
      case 'navigateToPublic': {
        return '/browse/browse-folders';
      }
      case 'navigateToFavFol': {
        return '/browse/favourite-folders';
      }
      case 'navigateToAdvSearch': {
        return '/search/advance-search';
      }
      case 'navigateToReports': {
        return '/report';
      }
      case 'navigateToAdmin': {
        return '/administration/configurations'
      }
      case 'navigateToActioned': {
        return '/workflow/actioned';
      }
      default: {
        return '/';
      }
    }
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.showDelegationInactiveDialog = false;
    this.selectedTabIndex = 0;
  }
}
