import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, CustomRouteReuseStategy } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
// import { SharedDocumentCartModule } from './shared-modules/document-cart/document-cart.module';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenubarModule } from 'primeng/menubar';
// import { SharedHTMLPipeModule } from './shared-modules/safe-html-pipe/safe-html-pipe';
// import { SharedDataTableModule } from './shared-modules/data-table/data-table.module';
// import { SharedFolTreeModule } from './shared-modules/fav-fol-tree/fav-fol-tree';
import { MessageModule } from 'primeng/message';
import { CKEditorModule } from 'ckeditor4-angular';
import { CgBusyModule } from 'angular-busy2';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouteReuseStrategy } from "@angular/router";
import { UserService } from './services/user.service';
import { CoreService } from './services/core.service';
import { AuthGuardHomeService } from './services/auth-guard-home.service';
import { WorkflowAuthGuardService } from './services/workflow-guard.service';
import { DefaultUrlGuardService } from './services/default-url-guard.service';
import { DocumentService } from './services/document.service';
import { BrowserEvents } from './services/browser-events.service';
import { BreadcrumbService } from './services/breadcrumb.service';
import { ReportService } from './services/report.service';
import { ContentService } from './services/content.service';
import { WorkflowItemsCountResolverService, WorkflowItemsResolverService } from './services/workflow-resolver.service';
import { AdminService } from './services/admin.service';
import { GrowlService } from './services/growl.service';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { WorkflowService } from './services/workflow.service';
import { MemoService } from './services/memo.service';
import { SharedHTMLPipeModule } from './shared-modules/safe-html-pipe/safe-html-pipe';
import { SharedDocumentCartModule } from './shared-modules/document-cart/document-cart.module';
import { SharedFolTreeModule } from './shared-modules/fav-fol-tree/fav-fol-tree';
import { HeaderComponent } from './components/generic-components/header/header.component';
import { AppBreadcrumbComponent } from './components/generic-components/breadcrumb/app.breadcrumb.component';
import { AppMenuComponent, AppSubMenuComponent } from './components/generic-components/menu/app.menu.component';
import { HomeComponent } from './components/generic-components/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AppMenuComponent,
    AppSubMenuComponent,
    AppBreadcrumbComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    ToastModule,
    MessagesModule, CheckboxModule, ButtonModule, SharedModule, TreeModule, HttpClientModule, ProgressSpinnerModule,
    AccordionModule, InputTextModule, TabMenuModule, MenubarModule,
    SharedFolTreeModule,
    MessageModule,
    SharedDocumentCartModule,
    SharedHTMLPipeModule,
    CKEditorModule,
    CommonModule,
    CgBusyModule.forRoot({
      backdrop: true
    })
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStategy },
    UserService, CoreService, AuthGuardHomeService, WorkflowAuthGuardService, 
    DefaultUrlGuardService, DocumentService, BrowserEvents, BreadcrumbService, ReportService,
    HttpClient, ContentService, WorkflowItemsCountResolverService, AdminService, GrowlService, 
    MessageService, ConfirmationService, WorkflowService, MemoService, WorkflowItemsResolverService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true, }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
