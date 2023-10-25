import {Component, Input, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {MenuItem} from 'primeng/api';
import {AppComponent} from '../../../app.component';

declare var jQuery: any;
// services
import {UserService} from '../../../services/user.service';
import {BrowserEvents} from '../../../services/browser-events.service';
// models
import {User} from '../../../models/user/user.model';
import * as global from '../../../global.variables';
import {WorkflowService} from "../../../services/workflow.service";
import {Subscription} from "rxjs";
import {CoreService} from "../../../services/core.service";

@Component({
  selector: 'app-menu',
  providers: [BrowserEvents],
  templateUrl: './app.menu.component.html',
  styleUrls: ['./app.menu.component.css']
})
export class AppMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() reset: boolean|any;
  private integration_url: string;
  private entry_app_url: string;
  model: any;
  layoutMenuScroller: HTMLDivElement;
  @ViewChild('layoutMenuScroller') layoutMenuScrollerViewChild: ElementRef;
  public user = new User();


  constructor(public app: AppComponent, public us: UserService, public bs: BrowserEvents, public ws: WorkflowService, private router: Router,
              public cs: CoreService) {
  }

  ngOnInit() {
    this.integration_url = global.integration_url;
    this.entry_app_url = global.entry_app_url;
    this.user = this.us.getCurrentUser();
    this.model = [
      {label: 'Dashboard', icon: 'dashboard', routerLink: ['/']},
      {
        label: 'Workflow', icon: 'timeline', routerLink: ['/workflow/inbox']
      },
      {
        label: 'Folders', icon: 'folder', routerLink: ['/browse/browse-folders']
      },

      {
        label: 'Browse Documents', icon: 'find_in_page', routerLink: ['/favourites']
      },
      {
        label: 'Shortcuts', icon: 'class', routerLink: ['/shortcuts']
      },
      {
        label: 'Help', icon: 'help_outline', routerLink: ['/help']
      }

    ];
    if (this.user && this.user.isAdmin === 'Y') {
      this.model.push(
        {
          label: 'Admin', icon: 'account_circle', routerLink: ['/administration/configurations']
        });
    }
    if (this.user && this.user.isReport === 'Y') {
      this.model.push(
        {
          label: 'ECM Reports', icon: 'library_books', routerLink: ['/report']
        });
    }
  }

  openSearch() {
    if (this.cs.isAdvanced === 'Y') {
      this.router.navigate(['/search/advance-search']);
    } else {
      this.router.navigate(['/search/simple-search']);
    }
  }

  openEntryApp() {
    window.open(this.entry_app_url);
  }

  ngAfterViewInit() {
    this.layoutMenuScroller = <HTMLDivElement> this.layoutMenuScrollerViewChild.nativeElement;

    setTimeout(() => {
      jQuery(this.layoutMenuScroller).nanoScroller({flash: true});
    }, 10);


  }


  updateNanoScroll() {
    setTimeout(() => {
      jQuery(this.layoutMenuScroller).nanoScroller();
    }, 500);
  }

  doNavigate() {
    this.router.navigate(['/workflow/launch']);
  }

  ngOnDestroy() {
    jQuery(this.layoutMenuScroller).nanoScroller({flash: true});
  }
}

@Component({
  /* tslint:disable:component-selector */
  selector: '[app-submenu]',
  /* tslint:enable:component-selector */
  template: `
    <ng-template ngFor let-child let-i="index" [ngForOf]="(root ? item : item.items)">
      <li routerLinkActive="active-menuitem"
          [routerLinkActiveOptions]="{exact: true}" [class]="child.badgeStyleClass">
        <a [href]="child.url||'#'" (click)="itemClick($event,child,i)" *ngIf="!child.routerLink"
           [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
           (mouseenter)="hover=true" (mouseleave)="hover=false" class="ripplelink">
          <i class="material-icons">{{child.icon}}</i>
          <span class="menuitem-text">{{child.label}}</span>
          <i class="material-icons layout-submenu-toggler" *ngIf="child.items">keyboard_arrow_down</i>
          <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
        </a>

        <a (click)="itemClick($event,child,i)" *ngIf="child.routerLink"
           [routerLink]="child.routerLink" [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
           (mouseenter)="hover=true" (mouseleave)="hover=false" class="ripplelink">
          <i class="material-icons">{{child.icon}}</i>
          <span class="menuitem-text">{{child.label}}</span>
          <i class="material-icons layout-submenu-toggler" *ngIf="child.items">>keyboard_arrow_down</i>
          <span class="menuitem-badge r-34" *ngIf="child.badge">{{child.badge}}</span>
        </a>
        <ul app-submenu [item]="child" *ngIf="child.items" [visible]="isActive(i)" [reset]="reset"
            [@children]="isActive(i) ? 'visible' : 'hidden'"></ul>
      </li>
    </ng-template>
  `,
  animations: [
    trigger('children', [
      state('visible', style({
        height: '*'
      })),
      state('hidden', style({
        height: '0px'
      })),
      transition('visible => hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppSubMenuComponent implements OnInit, OnDestroy {

  @Input() item: any;

  @Input() root: boolean;

  @Input() visible: boolean;

  _reset: boolean;

  activeIndex: number;

  hover: boolean;
  private user = new User();
  private subscriptions: Subscription[] = [];

  constructor(public app: AppComponent, public router: Router, public location: Location, public bs: BrowserEvents,
              public us: UserService, private ws: WorkflowService) {
    if (this.us.defaultViewSubMenuExpanded) {
      this.activeIndex = this.us.defaultViewSubMenuExpanded;
      this.us.defaultViewSubMenuExpanded = undefined;
    }
  }

  ngOnInit() {
    this.user = this.us.getCurrentUser();
  }


  getInboxCount() {
    this.ws.updateInboxCount();
    this.ws.updateDraftsCount();

  }

  itemClick(event: Event, item: MenuItem, index: number):any {
    this.bs.sideNavChange.emit(item.label);
    if (item.label === 'Workflow') {
      this.getInboxCount();
    }
    // avoid processing disabled items
    if (item.disabled) {
      event.preventDefault();
      return true;
    }

    // activate current item and deactivate active sibling if any
    if (item.routerLink || item.items || item.command || item.url) {
      this.activeIndex = (this.activeIndex === index) ? null : index;
    }

    // execute command
    if (item.command) {
      item.command({originalEvent: event, item: item});
    }

    // prevent hash change
    if (item.items || (!item.url && !item.routerLink)) {
      event.preventDefault();
    }

    // hide menu
    if (!item.items) {
      if (this.app.isMobile()) {
        this.app.sidebarActive = false;
        this.app.mobileMenuActive = false;
      }
    }
  }

  isActive(index: number): boolean {
    return this.activeIndex === index;
  }

  @Input() get reset(): boolean {
    return this._reset;
  }

  set reset(val: boolean) {
    this._reset = val;
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }
}
