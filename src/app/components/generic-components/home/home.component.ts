import { UserService } from '../../../services/user.service';
import {
  Component, HostListener, OnDestroy,
  OnInit, AfterContentInit, TestabilityRegistry,
} from '@angular/core';
import * as globalv from "../../../global.variables";
import { CoreService } from "../../../services/core.service";
import { WorkflowService } from '../../../services/workflow.service';
import { BrowserEvents } from "../../../services/browser-events.service";
import { Idle } from "idlejs/dist";
import { Subject, Subscription } from "rxjs";
// import { platform } from "os";
import { GrowlService } from "../../../services/growl.service";
import { User } from "../../../models/user/user.model";
import { AdminService } from "../../../services/admin.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy, OnInit, AfterContentInit {
  menuClick: boolean;

  menuButtonClick: boolean;

  topbarMenuButtonClick: boolean;

  topbarMenuClick: boolean;

  topbarMenuActive: boolean;

  activeTopbarItem: Element;

  // layoutStatic: boolean;
  // 10th-dec
  layoutStatic = true;

  sidebarActive: boolean;

  mobileMenuActive: boolean;

  darkMenu: boolean;

  isRTL: boolean;

  timeout: any;
  memoryTimeout: any;
  memoryTimeLimit = (60 * 60 * 1000);//900000;
  username: any;
  timeLimit = (30 * 60 * 1000);//900000;
  isAppActive = true;
  private currentUser = new User();
  // @ViewChild(InboxComponent) inboxComp:InboxComponent;
  //@ViewChild('draggable3', { read: ViewContainerRef }) VCR: ViewContainerRef;
  //@ViewChild(InboxComponent) inboxComp:InboxComponent;

  //comp: ComponentRef<any>;
  //@ViewChild('viewContainerRef', { read: ViewContainerRef }) VCR: ViewContainerRef;
  constructor(public router: Router, private us: UserService, private ws: WorkflowService, private bs: BrowserEvents,
    private coreService: CoreService, private growlService: GrowlService, private as: AdminService) {
    this.currentUser = this.us.getCurrentUser();

  }

  ngAfterContentInit() {
    this.setSessionTimeout();
    this.setMemorySessionTimeout();
    //  this.router.events
    // .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
    // .subscribe(event => {
    //   if (
    //     event.id === 1 &&
    //     event.url === event.urlAfterRedirects
    //   ) {
    //     console.log("app refresh");
    //      this.ws.designationValues=[];
    //   }
    // })
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    const subject = new Subject();
    window['destroySubject'] = subject;

    const destroySubscription: Subscription = subject.subscribe({
      next: () => {
        // const testabilityRegistry: TestabilityRegistry = platform['injector'].get(TestabilityRegistry);
        // (<any>testabilityRegistry)._applications.clear();

        //platform.destroy();
        //platform = null;
        delete window['webpackJsonp'];
        delete window['frameworkStabilizers'];
        delete window['getAngularTestability'];
        delete window['getAllAngularTestabilities'];
        delete window['getAllAngularRootElements'];
        delete window['ng'];

        destroySubscription.unsubscribe();
        // remove all the nodes from the body just to simulate a blank page
        document.body.innerHTML = "";
      }
    });
  }

  ngOnInit() {
    const idle = new Idle()
      .whenNotInteractive()
      .within(31, 60000)
      //.within(2,60000)
      .do(() => this.setTimeoutTrue())
      .start();
    this.username = globalv.username;
    //console.log(this.VCR);

    // this.us.logIn(this.username, 'def').subscribe(data => {
    //   localStorage.setItem('user', JSON.stringify(data));
    // })

  }
  setTimeoutTrue() {
    this.isAppActive = true;
    window.parent.postMessage({ v1: 'isActive', v2: this.isAppActive }, '*');
    //this.isAppActive=false;
  }

  @HostListener('window:message', ['$event'])
  onMessage(e) {
    //console.log(this.VCR);
    // this.VCR.clear();
    // if(this.inboxComp){
    //    //this.inboxComp.destroy();
    // }
    // console.log('HostListener'+e.data);
    switch (e.data) {
      case 'LoadDashboard': {
        this.ngOnInit();
        this.isAppActive = true;
        break;
      }
      case 'navigateToFav': {
        // this.checkMemoryReloadRequired(e.data);
        this.router.navigate(['/favourites']);
        break;
      }
      case 'navigateToRec': {
        this.router.navigate(['/recents']);
        break;
      }
      case 'navigateToTeam': {
        this.router.navigate(['/teamshared']);
        break;
      }
      case 'navigateToSettings': {
        this.router.navigate(['/settings']);
        break;
      }
      case 'navigateToDash': {
        this.router.navigate(['/']);
        break;
      }
      case 'navigateToLaunch': {
        //this.bs.launchRefreshRequired.emit('launch-feature');
        this.router.navigate(['/workflow/launch']);
        break;
      }
      case 'navigateToMemo': {
        //this.bs.launchRefreshRequired.emit('launch-feature');
        this.router.navigate(['/workflow/memo']);
        break;
      }
      case 'navigateToInbox': {
        /*console.log('previous '+ this.ws.inboxMenu.badge);
        const previousInboxBadge=this.ws.inboxMenu.badge;
        this.updateInboxCount(cb => {
          if (this.ws.inboxMenu.badge && this.ws.inboxMenu.badge !== previousInboxBadge) {
            console.log('new '+this.ws.inboxMenu.badge);
            this.bs.inboxRefreshRequired.emit('inbox-feature');
          }
          this.router.navigate(['/workflow/inbox']);
        });*/
        this.bs.inboxRefreshRequired.emit('inbox-feature');
        this.router.navigate(['/workflow/inbox']);
        break;
      }
      case 'navigateToSent': {
        this.bs.sentRefreshRequired.emit('sent-feature');
        this.router.navigate(['/workflow/sent']);
        break;
      }
      case 'navigateToDraft': {
        this.router.navigate(['/workflow/draft']);
        break;
      }
      case 'navigateToArchive': {
        this.bs.archiveRefreshRequired.emit('archive-feature');
        this.router.navigate(['/workflow/archive']);
        break;
      }
      case 'navigateToShortCuts': {
        this.router.navigate(['/shortcuts']);
        break;
      }
      case 'navigateToHelp': {
        this.router.navigate(['/help']);
        break;
      }
      case 'navigateToPublic': {
        this.router.navigate(['/browse/browse-folders']);
        break;
      }
      case 'navigateToFavFol': {
        this.router.navigate(['/browse/favourite-folders']);
        break;
      }
      case 'navigateToAdvSearch': {
        this.router.navigate(['/search/advance-search']);
        break;
      }
      case 'navigateToReports': {
        this.router.navigate(['/report']);
        break;
      }
      case 'navigateToAdmin': {
        this.router.navigate(['/administration/configurations']);
        break;
      }
      case 'navigateToActioned': {
        this.router.navigate(['/workflow/actioned']);
        break;
      }
      case 'showTimeout': {
        //window.parent.postMessage({v1:'isActive',v2:this.isAppActive}, '*');
        break;
      }
      default: {
        //statements;
        break;
      }
    }
    if (e.data && e.data.actionid == "NoReloadContent::NavigateToTaskDetails") {
      this.ws.getWorkitem(e.data.options.wiId, this.currentUser.EmpNo).subscribe(d => {
        let isRoleIdOrDelValid = false;
        let msg = 'User Delegation is no longer available';
        if (d.recipientEMPNo && d.recipientEMPNo > 0 && this.currentUser.delegated.length > 0) {
          this.currentUser.delegated.map(k => {
            if (k.userId === d.recipientEMPNo) {
              isRoleIdOrDelValid = true;
              this.ws.delegateId = k.id;
            }
          });
        }
        else if (d.recipientRoleId && d.recipientRoleId > 0 && this.currentUser.roles.length > 0) {
          this.currentUser.roles.map(j => {
            if (j.id && j.id === d.recipientRoleId) {
              isRoleIdOrDelValid = true;
            }
          });
          this.ws.roleId = d.recipientRoleId;
          msg = 'Role Delegation is no longer available';
        }
        if (d.recipientEMPNo && d.recipientEMPNo === this.currentUser.EmpNo) {
          isRoleIdOrDelValid = true;
        }
        if (isRoleIdOrDelValid) {
          this.showWorkItemDetailsFromMail(e);
        }
        else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Not Available', detail: msg
          });
          this.router.navigate(['/workflow/inbox']);
        }
      });
    } else if (e.data && e.data.actionid == "NoReloadContent::NavigateToTrack") {
      this.router.navigate(['/workflow/sent/taskdetail', {
        wfId: e.data.options.wfId,
        siId: e.data.options.siId,
        senderId: e.data.options.senderId,
        type: e.data.options.type
      }]);
    } else if (e.data && e.data.actionid == "NoReloadContent::NavigateToArchiveTaskDetails") {
      this.ws.getWorkitem(e.data.options.wiId, this.currentUser.EmpNo).subscribe(d => {
        let isRoleIdOrDelValid = false;
        let msg = 'User Delegation is no longer available';
        if (d.recipientEMPNo && d.recipientEMPNo > 0 && this.currentUser.delegated.length > 0) {
          this.currentUser.delegated.map(k => {
            if (k.userId === d.recipientEMPNo) {
              isRoleIdOrDelValid = true;
              this.ws.delegateId = k.id;
            }
          });
        }
        else if (d.recipientRoleId && d.recipientRoleId > 0 && this.currentUser.roles.length > 0) {
          this.currentUser.roles.map(j => {
            if (j.id && j.id === d.recipientRoleId) {
              isRoleIdOrDelValid = true;
            }
          });
          this.ws.roleId = d.recipientRoleId;
          msg = 'Role Delegation is no longer available';
        }
        if (d.recipientEMPNo && d.recipientEMPNo === this.currentUser.EmpNo) {
          isRoleIdOrDelValid = true;
        }
        if (isRoleIdOrDelValid) {
          this.showWorkItemDetailsFromMail(e);
        }
        else {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Not Available', detail: msg
          });
          this.router.navigate(['/workflow/archive']);
        }
      });
    } else if (e.data && e.data.actionid == "NoReloadContent::NavigateToArchiveTrack") {
      this.router.navigate(['/workflow/archive/taskdetail', {
        wfId: e.data.options.wfId,
        siId: e.data.options.siId,
        senderId: e.data.options.senderId,
        type: e.data.options.type
      }]);
    } else if(e.data && e.data.actionid == "NoReloadContent::NavigateToFolderPath"){
      this.router.navigate(['/browse/browse-folders', {
        folderPath: e.data.options.fPath,
        folderId: e.data.options.fId
      }]);
   }
    //this.VCR.clear();
    //setTimeout(function(){  }, 5000)
  }
  updateInboxCount(cb?) {
    this.ws.getUserNewWorkitems().subscribe(data => {
      this.ws.inboxMenu.badge = data.totalCount;
      if (cb) {
        cb();
      }
    });
  }
  showWorkItemDetailsFromMail(e) {
    this.ws.validateWorkitem(e.data.options.wiId).subscribe(res => {
      if (res === 'ACTIONED') {
        this.router.navigate(['/workflow/inbox']);
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Already Actioned', detail: 'Workitem already actioned'
        });

      } else if (res === 'INACTIVE') {
        this.router.navigate(['/workflow/inbox']);
        this.growlService.showGrowl({
          severity: 'error',
          summary: 'Workitem recalled', detail: 'Workitem is recalled'
        });
      }
      else {
        if (e.data.options.wiStatus && e.data.options.wiStatus == 'FINISH') {
          this.router.navigate(['/workflow/archive/taskdetail', {
            wiId: e.data.options.wiId,
            type: e.data.options.type
          }]);
        }
        else {
          this.router.navigate(['/workflow/inbox/taskdetail', {
            wiId: e.data.options.wiId,
            type: e.data.options.type
          }]);
        }
      }
    });
  }

  setSessionTimeout() {
    // this.timeout = setTimeout(() => {
    //  localStorage.removeItem('user');
    //  this.router.navigate(['/auth/session-timeout']);
    //   this.isAppActive=false;
    //
    // }, this.timeLimit);
  }

  resetSessionTimeout() {
    this.clearSessionTimeout();
    this.setSessionTimeout();
  }

  clearSessionTimeout() {
    clearTimeout(this.timeout);
  }

  ngOnDestroy() {
    this.clearSessionTimeout();
    this.as.designationValues = [];

  }

  @HostListener('click', ['$event'])
  uiClick(event: MouseEvent) {
    this.resetSessionTimeout();

  }

  onWrapperClick() {
    if (!this.menuClick && !this.menuButtonClick) {
      this.mobileMenuActive = false;
    }

    if (!this.topbarMenuClick && !this.topbarMenuButtonClick) {
      this.topbarMenuActive = false;
      this.activeTopbarItem = null;
    }

    this.menuClick = false;
    this.menuButtonClick = false;
    this.topbarMenuClick = false;
    this.topbarMenuButtonClick = false;
  }

  onMenuButtonClick(event: Event) {
    this.menuButtonClick = true;
    if (this.isMobile()) {
      this.mobileMenuActive = !this.mobileMenuActive;
    }
    event.preventDefault();
  }

  onTopbarMobileMenuButtonClick(event: Event) {
    this.topbarMenuButtonClick = true;
    this.topbarMenuActive = !this.topbarMenuActive;
    event.preventDefault();
  }

  onTopbarRootItemClick(event: Event, item: Element) {
    if (this.activeTopbarItem === item) {
      this.activeTopbarItem = null;
    } else {
      this.activeTopbarItem = item;
    }

    event.preventDefault();
  }

  onTopbarMenuClick(event: Event) {
    this.topbarMenuClick = true;
  }

  onSidebarClick(event: Event) {
    this.menuClick = true;
  }

  onToggleMenuClick(event: Event) {
    this.layoutStatic = !this.layoutStatic;
  }

  isMobile() {
    return window.innerWidth <= 1024;
  }

  setMemorySessionTimeout() {
    this.memoryTimeout = setTimeout(() => {
      this.coreService.isMemoryTimeout = true;
      //console.log('setMemorySessionTimeout' +this.coreService.isMemoryTimeout);
    }, this.memoryTimeLimit);
  }

  checkMemoryReloadRequired(page) {
    //console.log('checkMemoryReloadRequired'+this.coreService.isMemoryTimeout);
    if (this.coreService.isMemoryTimeout) {
      localStorage.setItem('pageRefresh', page);
      window.parent.postMessage('Reload', '*');
    }
  }
}
