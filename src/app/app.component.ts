import { Component, ElementRef, HostListener, TestabilityRegistry, ViewChild } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle, NavigationCancel, NavigationEnd, NavigationStart, OutletContext, Router,
  RouteReuseStrategy
} from "@angular/router";
import { Message, MessageService } from 'primeng/api';
import { GrowlService } from './services/growl.service';
import { Subject, Subscription } from 'rxjs';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  menuClick!: boolean;
  menuButtonClick!: boolean;
  topbarMenuButtonClick!: boolean;
  topbarMenuClick!: boolean;
  topbarMenuActive!: boolean;
  activeTopbarItem!: Element|any;
  layoutStatic = true;
  sidebarActive!: boolean;
  mobileMenuActive!: boolean;
  darkMenu!: boolean;
  isRTL: boolean=false;
  msgs: Message[] = [];
  loading = { loading: false };
  private subscriptions: any[] = [];
  @ViewChild('globalProgressBar')
  spinnerElement!: ElementRef;
  busy: boolean = false;

  constructor(private growlService: GrowlService,
    private messageService: MessageService,
    private router: Router) {
  }

  ngOnInit() {
    // this.ds.getLastSearchToLocalStorage();
    // var preventBackspace = require('prevent-backspace');
    // preventBackspace();
    this.growlService.growl$.subscribe((msg: Message|any) => {
      this.msgs = [];
      this.messageService.add({ key: 'toast1', severity: 'success', summary: 'Success', detail: msg });
      this.msgs.push(msg);
    });
    $(window).resize(function () {
      if (window.innerWidth < 800) {
        window.resizeTo(800, 800);
      }
    })
  }
  @HostListener('window:unload', ['$event'])
    unloadHandler(event:any) {
        window.sessionStorage.clear();
        console.log("session storage cleared");
    }
  @HostListener('window:beforeunload', ['$event']) reload($event:any) {
    //console.log("reloading");
    const subject = new Subject();
    (window as any)['destroySubject'] = subject;
    let platform = platformBrowserDynamic() as any;
    const destroySubscription: Subscription = subject.subscribe({
      next: () => {
        const testabilityRegistry: TestabilityRegistry = platform.injector.get(TestabilityRegistry);
        (<any>testabilityRegistry)._applications.clear();
        platform.destroy();
        platform = null;
        /*delete window['webpackJsonp'];
        delete window['frameworkStabilizers'];
        delete window['getAngularTestability'];
        delete window['getAllAngularTestabilities'];
        delete window['getAllAngularRootElements'];
        delete window['ng'];*/
        destroySubscription.unsubscribe();
        document.body.innerHTML = "";
      }
    });


  }

  ngAfterViewInit() {
    // this.busy = true;
    this.router.events.subscribe((event:any) => {
      if (event instanceof NavigationStart) {
        // this.coreService.progress = { busy: false, message: '', backdrop: true };
        // this.busy = false;
      }
      else if (event instanceof NavigationEnd ||
        event instanceof NavigationCancel) {
        this.loading.loading = false;
        // this.coreService.progress = { busy: false, message: '', backdrop: true };
        // this.busy = false;
      }
    }, err => {
      // this.busy = false;
    });
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

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();

  }
}

export class CustomRouteReuseStategy implements RouteReuseStrategy {

  handlers: { [key: string]: DetachedRouteHandle } = {};

  /**
   * Determines if this route (and its subtree) should be detached to be reused later.
   * Fired when shouldReuseRoute returns false
   * If it returns true, the method store will be fired.
   * @param route current route
   */
  shouldDetach(route: ActivatedRouteSnapshot|any): boolean {
    return route.data.shouldReuse || false;
  }

  /**
   * Determines the action we want to do when storing a route.
   * Fired when shouldDeatch returns true.
   * @param route : current route
   * @param handle : identifies the stored component
   */
  store(route: ActivatedRouteSnapshot|any, handle: {}): void {
    if (route.data.shouldReuse) {
      this.handlers[route.routeConfig.path] = handle;
    }
  }

  /**
   * Determines if the current route should be reused from the stored components or not.
   * Fired when shouldReuseRoute returns false
   * @param route current route
   */
  shouldAttach(route: ActivatedRouteSnapshot|any): boolean {
    return !!route.routeConfig && !!this.handlers[route.routeConfig.path];

    // Reset all the stored routes if we're on the AuthComponent
    /*if (route.component === LaunchComponent) {
      this.handlers = {};
      return false;
    }*/
  }

  /**
   * Returns the stored route we want to reuse..
   * Fired when shouldAttach returns true
   * @param route current route
   */
  retrieve(route: ActivatedRouteSnapshot|any): DetachedRouteHandle|any {
    if (!route.routeConfig) return null;
    if (route.routeConfig.loadChildren) return null;
    return this.handlers[route.routeConfig.path];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot|any, curr: ActivatedRouteSnapshot): boolean {
    return future.data.shouldReuse || false;
  }

  /*storedRouteHandles = new Map<string, DetachedRouteHandle>();
  allowRetriveCache = {
    'inbox': true,
    'sent': true,
    'archive' : true,
    'actioned' : true
  };

  shouldReuseRoute(before: ActivatedRouteSnapshot, curr:  ActivatedRouteSnapshot): boolean {
    console.log('before---------' + this.getPath(before));
    console.log('curr-----------' + this.getPath(curr));
    if ((this.getPath(before) === 'inbox/taskdetail' || this.getPath(before) === 'sent/taskdetail' ||
        this.getPath(before) === 'archive/taskdetail' || this.getPath(before) === 'actioned/taskdetail') &&
        (this.getPath(curr) === 'inbox' || this.getPath(curr) === 'sent' ||
        this.getPath(curr) === 'archive' || this.getPath(curr) === 'actioned')) {
      this.allowRetriveCache[this.getPath(curr)] = true;
    } else {
      this.allowRetriveCache[this.getPath(curr)] = false;
    }
    return before.routeConfig === curr.routeConfig;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getPath(route);
    if (this.allowRetriveCache[path]) {
      return this.storedRouteHandles.has(this.getPath(route));
    }
    return false;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.storedRouteHandles.get(this.getPath(route)) as DetachedRouteHandle;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getPath(route);
    if (this.allowRetriveCache.hasOwnProperty(path)) {
      return true;
    }
    return false;
  }

  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
    const path = this.getPath(route);
    if (path === 'inbox' || path === 'sent' || path === 'archive' || path === 'actioned') {
      this.storedRouteHandles.set(this.getPath(route), detachedTree);
    } else if(path === 'inbox/taskdetail' || path === 'sent/taskdetail' || path === 'archive/taskdetail' || path === 'actioned/taskdetail') {
      //this.deactivateOutlet(detachedTree);
    } else {
      this.deactivateAllHandles();
    }
  }

  private getPath(route: ActivatedRouteSnapshot): string {
    if (route.routeConfig !== null && route.routeConfig.path !== null) {
      console.log('getPath---------'+route.routeConfig.path);
      return route.routeConfig.path;
    }
    return '';
  }*/

  /*// Todo: we manually destroy the component view here. Since RouteReuseStrategy is experimental, it
  // could break anytime the protocol change. We should alter this once the protocol change.
  private deactivateOutlet(handle: DetachedRouteHandle): void {
    /!*const componentRef: ComponentRef<any> = handle['componentRef'];
    if (componentRef) {
      componentRef.destroy()
    }*!/
    /!*this.storedRouteHandles.forEach((value: any, key: string) => {
      (<any>this.storedRouteHandles.get(key))
        .contexts.get('primary').outlet.component.ngOnDestroy();
    });
    this.storedRouteHandles.clear();*!/
    //this.storedRouteHandles = new Map<string, DetachedRouteHandle>();
  }*/

  /*private deactivateAllHandles(): void {
    this.storedRouteHandles.forEach((handle: DetachedRouteHandle) => this.destroyComponent(handle));
    this.storedRouteHandles.clear();
  }

  private destroyComponent(handle: DetachedRouteHandle): void {
    const componentRef: ComponentRef<any> = handle['componentRef'];
    if (componentRef) {
      componentRef.destroy();
    }
  }*/
}