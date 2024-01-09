import { NewsModel } from '../../../models/admin/news.model';
import { NewsService } from '../../../services/news.service';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as global from '../../../global.variables';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { CoreService } from '../../../services/core.service';
import { GrowlService } from '../../../services/growl.service';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { User } from "../../../models/user/user.model";
import { UserService } from "../../../services/user.service";
import * as _ from "lodash";
import { Table } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NewsComponent implements OnInit {
  @ViewChild('dt1') dataTable!: Table;
  public newsModel = new NewsModel();
  public newsList: any;
  isCreate = true;
  active: any;
  expire: any;
  news: string;
  subject: string;
  emptyMessage: any;
  today: Date;
  private user: User;
  private subscriptions: Subscription[] = [];
  public itemsPerPage: any = 10;
  public allnews: any;
  viewnews = false;
  busy: boolean;
  constructor(
    private toastr:ToastrService,
    private ns: NewsService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private coreService: CoreService,
    private growlService: GrowlService,
    private breadcrumbService: BreadcrumbService) {
  }

  refresh() {
    this.busy = true;
    this.ns.getAllNews().subscribe(data => {
      this.busy = false;
      this.assignNews(data)
    }, err => {
      this.busy = false;
    });
  }

  ngOnInit() {
    this.userService.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.today = new Date();
    this.emptyMessage = global.no_news;
    this.user = this.userService.getCurrentUser();
    this.breadcrumbService.setItems([
      { label: 'Admin' },
      { label: 'News' }
    ]);
    this.busy = true;
    this.ns.getAllNews().subscribe(data => {
      this.busy = false;
      this.assignNews(data)
    }, err => {
      this.busy = false;
    });
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
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

  assignNews(data) {
    data.map((d, i) => {
      if (d.activeDate !== undefined) {
        d.activeDate2 = this.coreService.getFormattedDateString(d.activeDate, this.coreService.dateTimeFormats.DDMMYYYY, '/');
      }
      if (d.expiryDate !== undefined) {
        d.expiryDate2 = this.coreService.getFormattedDateString(d.expiryDate, this.coreService.dateTimeFormats.DDMMYYYY, '/');
      }
      /*if (d.createdDate !== undefined) {
        d.createdDate2 = this.coreService.getFormattedDateString(d.createdDate,this.coreService.dateTimeFormats.DDMMYYYY,null);
      }
      if (d.modifiedDate !== undefined) {
        d.modifiedDate2 = this.coreService.getFormattedDateString(d.modifiedDate,this.coreService.dateTimeFormats.DDMMYYYY,null);
      }*/
    });
    this.newsList = data;
  }

  createNews() {
    this.newsModel.activeDate = this.active;
    this.newsModel.expiryDate = this.expire;
    this.newsModel.message = this.news;
    this.newsModel.subject = this.subject;
    this.newsModel.createdBy = this.user.fulName;

    if (this.newsModel.message !== undefined && this.newsModel.message !== '' &&
      this.newsModel.subject !== undefined && this.newsModel.subject !== '' &&
      this.newsModel.activeDate !== undefined && this.newsModel.expiryDate !== undefined && this.news) {
      if (this.news.length <= 2000) {
        let self = this;
        let originalRecordsToCompare = _.cloneDeep(self.newsList);
        if (self.newsModel.id) {
          originalRecordsToCompare = _.filter(originalRecordsToCompare, function (record) {
            return record.id !== self.newsModel.id;
          });
        }
        let record = _.find(originalRecordsToCompare, function (r) {
          return r.subject.trim().toLowerCase() === self.subject.trim().toLowerCase() &&
            self.coreService.getFormattedDateString(r.activeDate, self.coreService.dateTimeFormats.DDMMYYYY, '/') ===
            self.coreService.getFormattedDateString(self.active, self.coreService.dateTimeFormats.DDMMYYYY, '/') &&
            self.coreService.getFormattedDateString(r.expiryDate, self.coreService.dateTimeFormats.DDMMYYYY, '/') ===
            self.coreService.getFormattedDateString(self.expire, self.coreService.dateTimeFormats.DDMMYYYY, '/');
        });
        if (record) {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Failure', detail: 'News Already Exists.'
          // });
          this.toastr.error('News Already Exists.', 'Failure');
        } else {
          this.subscriptions.push(this.ns.saveNews(this.newsModel).subscribe(data => this.saveNewsSuccess(data), err => this.saveFailed()));
        }
      }
      else {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Max Length Exceeded', detail: 'Text Entered For News Exceeds Maximum Length'
        // });
        this.toastr.error('Text Entered For News Exceeds Maximum Length', 'Max Length Exceeded');
      }
    }
    else {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Fill All Inputs', detail: 'Please Fill All Inputs To Save'
      // });
      this.toastr.error('Please Fill All Inputs To Save', 'Fill All Inputs');
      //this.subscriptions.push(this.ns.getAllNews().subscribe(data=>this.assignNews(data)));
    }
  }
  reset() {
    this.dataTable.reset()
  }
  confirm(event) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to remove?',
      key: 'removeNews',
      accept: () => {
        //Actual logic to perform a confirmation
        this.removeNews(event.id);
      }
    });
  }

  removeNews(dat) {
    this.ns.removeNews(dat).subscribe(data => this.removeSuccess(), err => this.removeFailed())
  }

  removeSuccess() {
    // this.growlService.showGrowl({
    //   severity: 'info',
    //   summary: 'Success', detail: 'Removed News Successfully'
    // });
    this.toastr.info('Removed News Successfully', 'Success');
    this.ns.getAllNews().subscribe(data => this.assignNews(data));
  }

  removeFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Remove Failed'
    // });
    this.toastr.error('Remove Failed', 'Failure');
  }

  saveNewsSuccess(data) {
    if (this.isCreate) {
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'News Created'
      // });
      this.toastr.info('News Created', 'Success');
    }
    else {
      // this.growlService.showGrowl({
      //   severity: 'info',
      //   summary: 'Success', detail: 'News Saved'
      // });
      this.toastr.info('News Saved', 'Success');
    }

    this.subscriptions.push(this.ns.getAllNews().subscribe(res => this.assignNews(res)));
    this.expire = undefined;
    this.news = undefined;
    this.subject = undefined;
    this.active = undefined;
    this.isCreate = true;
  }

  saveFailed() {
    // this.growlService.showGrowl({
    //   severity: 'error',
    //   summary: 'Failure', detail: 'Failed To Save News'
    // });
    this.toastr.error('Failed To Save News', 'Failure');
  }

  viewAllNews(row) {
    let data = _.find(this.newsList, function (r) {
      return r.id === row.id;
    });
    this.viewnews = true;
    this.allnews = data;
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  editNews(row) {
    let selnews = _.find(this.newsList, function (r) {
      return r.id === row.id;
    });
    this.isCreate = false;
    //  this.newsModel=selnews;
    this.newsModel.id = selnews.id;
    this.newsModel.subject = this.subject = selnews.subject;
    this.newsModel.message = this.news = selnews.message;
    this.newsModel.modifiedBy = this.user.fulName;
    var fromDate = new Date(selnews.activeDate);
    var toDate = new Date(selnews.expiryDate);
    this.active = fromDate;
    this.expire = toDate;
  }

  exportToExcel() {
    let array = [];
    this.newsList.map(d => {
      d.activeDate = d.activeDate2;
      d.expiryDate = d.expiryDate2;
      delete d.activeDate2;
      delete d.expiryDate2;
      delete d.createdDate2;
      delete d.modifiedDate2;
      array = Object.keys(d);
    });
    array.shift();
    this.coreService.exportToExcel(this.newsList, 'News ' + this.coreService.getDateTimeForExport() + '.xlsx', array);
    this.refresh();
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.isCreate = true;
    this.clearSubscriptions();
    this.viewnews = false;
  }
}
