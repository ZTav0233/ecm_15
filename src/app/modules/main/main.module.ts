import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainComponent } from './main.component';
import { HttpClientModule } from '@angular/common/http';
import { RecentsComponent } from '../../components/shortcut-components/recents/recents.component';
import { TeamsharedDocsComponent } from '../../components/shortcut-components/teamshared-docs/teamshared-docs.component';
import { FavouritesComponent } from '../../components/shortcut-components/favourites/favourites.component';
import { AdminService } from '../../services/admin.service';
import { ConfigurationService } from '../../services/configuration.service';
import { NewsService } from '../../services/news.service';
import { SharedRightPanelModule } from '../../shared-modules/right-panel/right-panel.module';
import { SharedTreeModule } from '../../shared-modules/tree-module/tree.module';
import { MatTabsModule } from '@angular/material/tabs'
import { SharedHTMLPipeModule } from '../../shared-modules/safe-html-pipe/safe-html-pipe';
import { NgChartsModule } from 'ng2-charts';
import { ShortcutsComponent } from "../../components/shortcut-components/shortcuts/shortcuts.component";
import { HelpComponent } from "../../components/shortcut-components/help/help.component";
import { CgBusyModule } from 'angular-busy2';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenubarModule } from 'primeng/menubar';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MainRoutingModule } from './main-routing.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { SharedDataTableModule } from 'src/app/shared-modules/data-table/data-table.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MainRoutingModule,
    ReactiveFormsModule,
    MatTabsModule,
    HttpClientModule,
    AccordionModule,
    ButtonModule,
    PanelModule,
    SelectButtonModule,
    TooltipModule,
    TreeModule,
    TabViewModule,
    DialogModule,
    SharedRightPanelModule,
    SharedTreeModule,
    SharedHTMLPipeModule,
    TabMenuModule,
    MenubarModule,
    // NgxAsideModule,
    NgChartsModule,
    ContextMenuModule,
    CgBusyModule,
    MessageModule,
    MessagesModule,
    ConfirmDialogModule,
    TableModule,
    SharedDataTableModule


  ],
  declarations: [
    DashboardComponent,
    MainComponent,
    RecentsComponent,
    TeamsharedDocsComponent,
    FavouritesComponent,
    ShortcutsComponent,
    HelpComponent,
  ],
  providers: [
    //ContentService,WorkflowService,
    NewsService, AdminService, ConfigurationService,
  ]
})
export class MainModule {
}
