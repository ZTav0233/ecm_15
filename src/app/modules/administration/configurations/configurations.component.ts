import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigurationService } from '../../../services/configuration.service';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from '../../../services/core.service';
import { UserService } from "../../../services/user.service";
import { User } from "../../../models/user/user.model";
import { ContentService } from "../../../services/content.service";
import * as _ from "lodash";
import { Table } from 'primeng/table';

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.css']
})
export class ConfigurationsComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dataTable!: Table;
  @ViewChild('dt1') dataTable1!: Table;
  @ViewChild('dt2') dataTable2!: Table;
  private subscriptions: Subscription[] = [];
  public configurationList: any[] = [];
  public updatedRow: any = {};
  public showEditKeyValue = false;
  public itemsPerPage: any = 10;
  public colHeaders: any[] = [];
  public user = new User();
  public entryTemplates: any[] = [];
  public logLevelOptions: any[] = [];
  activeIndex=0
  busy: boolean;

  constructor(private configService: ConfigurationService, private coreService: CoreService, private growlService: GrowlService,
    private breadcrumbService: BreadcrumbService, private us: UserService, private cs: ContentService) {
    this.colHeaders = [{ field: 'keyName', header: 'Key Name', hidden: false }, { field: 'value', header: 'Value', hidden: false },
    { field: 'appId', header: 'appId', hidden: true }, { field: 'configScope', header: 'configScope', hidden: true },
    { field: 'keyDesc', header: 'Description', hidden: false }, { field: 'createdBy', header: 'Created By', hidden: true },
    { field: 'createdDate', sortField: 'createdDate2', header: 'Created Date', hidden: true },
    { field: 'modifiedBy', header: 'Modified By', hidden: false },
    { field: 'modifiedDate', sortField: 'modifiedDate2', header: 'Modified Date', hidden: false }
    ];
    this.user = this.us.getCurrentUser();
    this.logLevelOptions = [{ label: 'Debug', value: 1 }, { label: 'Info', value: 2 }, { label: 'Warning', value: 3 },
    { label: 'Error', value: 4 }, { label: 'Fatal', value: 5 }];
  }

  refreshConfig(flag) {
    if (flag === 'SYSTEM') {
      this.getConfigurations('SYSTEM');
    }
    else if (flag === 'LOG') {
      this.getConfigurations('LOG');
    }
    else if (flag === 'APP') {
      this.getConfigurations('APP');
    }
  }

  ngOnInit() {
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.getConfigurations('SYSTEM');
    this.getEntryTemplates();
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'Configurations' }
    ]);
  }
  reset(){
    this.dataTable.reset()
    this.dataTable1.reset()
    this.dataTable2.reset()
  }
  applyFilterGlobal($event, stringVal) {
    console.log(($event.target as HTMLInputElement).value);
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  applyFilterGlobal1($event, stringVal) {
    console.log(($event.target as HTMLInputElement).value);
    this.dataTable1.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  applyFilterGlobal2($event, stringVal) {
    console.log(($event.target as HTMLInputElement).value);
    this.dataTable2.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }

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

  getConfigurations(scope) {
    this.busy = true;
    this.configService.getAllConfigurations(scope).subscribe(config => {
      this.busy = false;
      config.map((d) => {
        //d.value="sjfhjksdhfjksdfjksdhfjksdfjksdhjkkkfhsdjkfhjksdfhjksdhfjksdfhjksdfksdfjksdfjksdfjksdfjksd"
        d.modifiedDate2 = this.coreService.getTimestampFromDate(d.modifiedDate, null, '/');
        d.createdDate2 = this.coreService.getTimestampFromDate(d.createdDate, null, '/');
      });
      this.configurationList[scope] = config;
    }, err => {
      this.busy = false;
    });
  }

  getEntryTemplates() {
    const subscription = this.cs.getAllEntryTemplates().subscribe(template => {
      this.entryTemplates = [];
      template.map((temp, i) => {
        this.entryTemplates.push({ label: temp.symName, value: temp.symName });
      });
    });
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  prepareEdit(row, gridType) {
    let record = _.find(this.configurationList[gridType], function (r) {
      return r.id === row.id;
    });
    this.updatedRow = {
      'id': record.id,
      'name': record.keyName,
      'value': record.value,
      'appId': record.appId,
      'scope': record.configScope,
      'empName': this.user.fulName,
      'desc': record.keyDesc
    };
  }

  saveValue() {
    this.subscriptions.push(this.configService.updateConfigurationRow([this.updatedRow]).subscribe(res => {
      this.growlService.showGrowl({
        severity: 'info',
        summary: 'Success', detail: 'Saved Successfully'
      });
      this.showEditKeyValue = false;
      this.getConfigurations(this.updatedRow.scope);
    }, Error => {
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'Failed'
      });
    }));
  }

  onTabOpen(event) {
    console.log(event);
    
    if (event.index === 1) {
      this.getConfigurations('APP');
    } else if (event.index === 2) {
      this.getConfigurations('LOG');
    }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    this.subscriptions = [];
    this.configurationList = [];
    this.updatedRow = {};
    this.showEditKeyValue = false;
  }
}
