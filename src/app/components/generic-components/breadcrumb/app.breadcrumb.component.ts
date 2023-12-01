import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {MenuItem} from 'primeng/api';
import { interval } from 'rxjs';
import { map, share } from 'rxjs/operators';
import {BreadcrumbService} from "../../../services/breadcrumb.service";
import {User} from "../../../models/user/user.model";
import * as global from '../../../global.variables';
import {Router} from "@angular/router";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './app.breadcrumb.component.html'
})
export class AppBreadcrumbComponent implements OnDestroy {
  subscription: Subscription;
  items: MenuItem[];
  tabItems: any[];
  megaItemsConfig: any[];
  megaItemsTemp: any[];
  megaItemsManage: any[];
  megaItemsSec: any[];
  selectedItem: any;
  private integration_url: string;
  private entry_app_url: string;
  public user = new User();
  isAdmin = false;
  isBrowseDocs = false;

  public now = interval(1000).pipe(
    map(() => new Date()),
    share()
  );

  constructor(public breadcrumbService: BreadcrumbService, public us: UserService, private router: Router) {
    // console.log(breadcrumbService.items);
    
    this.integration_url = global.integration_url;
    this.entry_app_url = global.entry_app_url;
    this.user = this.us.getCurrentUser();

    if (this.router.url.includes('workflow')) {
      this.isAdmin = false;
      this.isBrowseDocs = false;
      this.tabItems = [];

    }
    else if (this.router.url === '/') {
      this.tabItems = [];
      this.isAdmin = false;
      this.isBrowseDocs = false;
    }
    else if (this.router.url.includes('browse')) {
      this.isAdmin = false;
      this.tabItems = [];
      this.isBrowseDocs = false;
    }
    else if (this.router.url.includes('favourites') || this.router.url.includes('recents') || this.router.url.includes('teamshared')) {
      this.isAdmin = false;
      this.isBrowseDocs = true;
      this.tabItems = [];
      
    }
    else if (this.router.url.includes('/shortcuts')) {
      this.tabItems = [];
      this.isAdmin = false;
      this.isBrowseDocs = false;
    }
    else if (this.router.url.includes('/help')) {
      this.tabItems = [];
      this.isAdmin = false;
      this.isBrowseDocs = false;
    }
    else if (this.router.url.includes('/report')) {
      this.tabItems = [];
      this.isAdmin = false;
      this.isBrowseDocs = false;
    }
    else if (this.router.url.includes('administration')) {
      this.isAdmin = true;
      this.isBrowseDocs = false;
      this.megaItemsConfig = [{
        label: 'Configuration', icon: 'fa fa-fw ui-icon-account-circle',
        items: [
          {label: 'Configuration', icon: 'fa fa-fw ui-icon-build', routerLink: ['/administration/configurations']},
          {
            label: 'Integration',
            icon: 'fa fa-fw ui-icon-vertical-align-center',
            routerLink: ['/administration/integration']
          }]
      }];
      this.megaItemsSec = [{
        label: 'Security Update Tool', icon: 'fa fa-fw ui-icon-account-circle',
        items: [
          {label: 'Legacy Exception Doc - Security Tool', icon: 'fa fa-fw ui-icon-compare', routerLink: ['/administration/security-tool']},
          ]
      }];

      this.megaItemsTemp = [{
        label: 'Template and Security', icon: 'fa fa-fw ui-icon-account-circle',
        items: [
          {
            label: 'Entry Template Mapping',
            icon: 'fa fa-fw ui-icon-input',
            routerLink: ['/administration/entry-template-mapping']
          },
          {label: 'Access Policies', icon: 'fa fa-fw ui-icon-security', routerLink: ['/administration/access-policies']},
          {
            label: 'Access Policy Mapping',
            icon: 'fa fa-fw ui-icon-beenhere',
            routerLink: ['/administration/access-policy-mapping']
          },
          {label: 'Manage Access Policy', icon: 'fa fa-fw ui-icon-verified-user', routerLink: ['/administration/manage-accesspolicy']},
          {label: 'Lookup', icon: 'fa fa-fw ui-icon-arrow-drop-down-circle', routerLink: ['/administration/lookups']},
          {label: 'Lookup Mapping', icon: 'fa fa-fw ui-icon-swap-horiz', routerLink: ['/administration/lookup-mapping']},
        ]
      }];

      this.megaItemsManage = [{
        label: 'Management', icon: 'fa fa-fw ui-icon-account-circle',
        items: [
          {
            label: 'Role Management',
            icon: 'fa fa-fw ui-icon-supervisor-account',
            routerLink: ['/administration/role-management']
          },
          {label: 'ECM Users', icon: 'fa fa-fw ui-icon-people-outline', routerLink: ['/administration/ecm-users']},
          {label: 'ECM Report Users', icon: 'fa fa-fw ui-icon-contacts', routerLink: ['/administration/ecm-report-user']},
          {label: 'ECM Global List', icon: 'fa fa-fw ui-icon-view-stream', routerLink: ['/administration/ecm-global-list']},
          {
            label: 'ECM Administrators',
            icon: 'fa fa-fw ui-icon-account-circle',
            routerLink: ['/administration/ecm-admin-user']
          },
          {label: 'News', icon: 'fa fa-fw ui-icon-record-voice-over', routerLink: ['/administration/news']},
          {
            label: 'ECM Error Logs',
            icon: 'fa fa-fw ui-icon-assignment-late',
            routerLink: ['/administration/errorlog-management']
          },
          {label: 'ECM Admin Logs', icon: 'fa fa-fw ui-icon-assignment-ind', routerLink: ['/administration/ecm-admin-logs']},
          {
            label: 'ECM Exclude Operator',
            icon: 'fa fa-fw ui-icon-event-busy',
            routerLink: ['/administration/ecm-exclude-users']
          },
          {label: 'ECM Org Unit Management', icon: 'fa fa-fw ui-icon-account-balance', routerLink: ['/administration/orgunit-management']},
           // {label: 'ECM Document OCR Tracker', icon: 'fa fa-fw ui-icon-settings-overscan', routerLink: ['/administration/ecmdoc-track']}
        ]
      }];
    }
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
