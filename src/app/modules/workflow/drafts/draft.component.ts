import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren, QueryList
} from '@angular/core';
import { BreadcrumbService } from "../../../services/breadcrumb.service";
import { WorkflowService } from '../../../services/workflow.service';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user/user.model';
import { WorkitemSet } from '../../../models/workflow/workitem-set.model';
import { Router } from '@angular/router';
import { DocumentService } from "../../../services/document.service";
import { CoreService } from "../../../services/core.service";
import { DataTableComponent } from "../../../components/generic-components/datatable/datatable.component";
import { BrowserEvents } from "../../../services/browser-events.service";
import { GrowlService } from "../../../services/growl.service";

@Component({
  templateUrl: './draft.component.html',
})
export class DraftComponent implements OnInit, OnDestroy {
  public selectedItem: any[] = [];
  public colHeaders: any[] = [];
  public itemsPerPage: any = 10;
  public draftWorkitems: WorkitemSet[] = [];
  public columns: any[];
  public selectedColumns: string[] = [];
  public user = new User();
  public actions: string[] = [];
  public selectedAction: any;
  public disableAction = true;
  public selectedCount = 0;
  private subscriptions: Subscription[] = [];
  @ViewChildren(DataTableComponent) dataTableComponent: QueryList<DataTableComponent>;
  busy: boolean;
  public defaultSortField;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private ws: WorkflowService,
    private us: UserService,
    private router: Router,
    private ds: DocumentService,
    private coreService: CoreService,
    private bs: BrowserEvents,
    private gs: GrowlService) {
    this.user = this.us.getCurrentUser();
  }

  ngOnInit() {
    this.bs.removeDraft.subscribe(d => {
      this.ws.deleteDraft(d).subscribe(data => {
        this.gs.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Draft item removed successfully'
        });
        this.getDrafts();
      }, error => {
        this.gs.showGrowl({
          severity: 'error',
          summary: 'Failure', detail: 'Failed to remove draft item'
        });
      });
    });
    this.closeAllDialog();
    this.breadcrumbService.setItems([
      { label: 'Workflow' },
      { label: 'Drafts' },
      { label: this.user.fulName }
    ]);
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.getDrafts();
    this.actions = ['View'];
    this.colHeaders = [{ field: 'wiAction', header: 'Actions', hidden: true },
    { field: 'draftDate', header: 'Draft Date', hidden: true, sortField: 'draftDate2' }
    ];
    this.columns = [];
    this.columns = [{ label: 'Actions', value: 'wiAction' },
    { label: 'Draft Date', value: 'draftDate', sortField: 'draftDate2' }
    ];
    this.selectedColumns = ['wiAction', 'draftDate'];
    for (const colunm of this.selectedColumns) {
      for (const tableHead of this.colHeaders) {
        if (tableHead.field === colunm) {
          tableHead.hidden = false;
        }
      }
    }
  }

  // @HostListener('window:message', ['$event'])
  // onMessage(e) {
  //   if (e.data === 'navigateToDraft') {
  //     this.refreshTable();
  //   }
  // }

  assignPagination(val) {
    if (val !== undefined) {
      val.map((d, i) => {
        if (d.key === 'Page Size') {
          if (d.val) {
            this.itemsPerPage = parseInt(d.val, 10);
          } else {
            this.itemsPerPage = 10;
          }
        }
      });
    }
  }

  assignDraftItems(data) {
    data.map((item, index) => {
      item.subject = item.workflow.subject;
      item.draftDate2 = this.coreService.getTimestampFromDate(item.draftDate, null, '/');
    });
    this.draftWorkitems = data;
    console.log(this.draftWorkitems);
    
    this.defaultSortField = 'draftDate2';
  }


  getData(data: any) {
    console.log(data);
    
    this.selectedItem = data;
    if (this.selectedItem) {
      if (this.selectedItem.length > 0) {
        this.disableAction = false;
        this.selectedCount = this.selectedItem.length;
      } else {
        this.disableAction = true;
        this.selectedCount = 0;
      }
    }
  }

  getRowTrackBy = (index, item) => {
    return item.draftId;
  };

  getSelectedAction(data: any) {
    if (data === 'View') {
      this.router.navigate(['/workflow/launch', 'draftLaunch', { id: this.selectedItem[0].draftId }]);
    }
  }

  columnSelectionChanged(event: Event) {
    for (const tableHead of this.colHeaders) {
      tableHead.hidden = true;
    }
    for (const colunm of this.selectedColumns) {
      for (const tableHead of this.colHeaders) {
        if (tableHead.field === colunm) {
          tableHead.hidden = false;
        }
      }
    }
  }

  actionSelectionChanged(event) {
  }

  getDrafts() {
    this.busy = true;
    this.ws.getDrafts(this.user.EmpNo, 'USER').subscribe(data => {
      this.busy = false;
      this.assignDraftItems(data)
    }, err => {
      this.busy = false;
    });
  }

  refreshTable() {
    console.log("refreshTable")
    //this.ws.updateDraftsCount();
    this.getDrafts();
  }

  viewDraft(event) {
    console.log(event);
    
    if (event.memo) {
      this.router.navigate(['/workflow/memo', 'draftMemo', { id: event.draftId }]);
    } else {
      this.router.navigate(['/workflow/launch', 'draftLaunch', { id: event.draftId }]);
    }
    window.parent.postMessage('GoToLaunch', '*');
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  destroyKeys() {
    Object.keys(this).map(k => {
      this[k] = null;
      //delete this[k];
    })
  }

  closeAllDialog() {
    if (this.dataTableComponent) {
      this.dataTableComponent.map((d) => {
        d.hideAllDialog();
      })
    }
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.selectedItem = [];
    this.colHeaders = [];
    this.itemsPerPage = undefined;
    this.draftWorkitems = [];
    this.columns = [];
    this.selectedColumns = [];
    this.user = undefined;
    this.actions = [];
    this.selectedAction = undefined;
    this.disableAction = true;
    this.selectedCount = 0;
    this.destroyKeys();
  }
}
