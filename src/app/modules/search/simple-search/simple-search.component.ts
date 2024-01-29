import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { UserService } from '../../../services/user.service';
import { DocumentService } from '../../../services/document.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BrowserEvents } from '../../../services/browser-events.service';
import { CoreService } from '../../../services/core.service';
import * as global from '../../../global.variables';
import { ContentService } from "../../../services/content.service";
import { GrowlService } from "../../../services/growl.service";
import { saveAs } from 'file-saver';
import { SearchDocumentComponent } from '../../../components/generic-components/search-document/search.component';
import { Subscription } from "rxjs";
import * as _ from "lodash";
import { DataTableComponent } from "../../../components/generic-components/datatable/datatable.component";
import { AdminService } from "../../../services/admin.service";
import * as globalv from "../../../global.variables";
import { SharedDataTableModule } from 'src/app/shared-modules/data-table/data-table.module';
import { ToastrService } from 'ngx-toastr';
@Component({
  templateUrl: './simple-search.component.html',
})
export class SimpleSearchComponent implements OnInit, OnDestroy {
  currentUser;
  searchObj: any = {};
  subscriptions: any = [];
  //selectedIndex = 0;
  sideMenu: any;
  isSearchSelected = true;
  public selectedItem: any[] = [];
  screen: any = 'Simple Search';
  public colHeaders = [
    { field: 'creator', header: 'Created By' },
    { field: 'documentDate', header: 'Document Date', sortField: 'documentDate2' },
    { field: 'orgcode', header: 'OrgCode' },
    { field: 'ecmno', header: 'ECM No' },
    { field: 'referenceNo', header: 'Reference No' },
    { field: 'addOn', header: 'Added On', sortField: 'addOn2' },
    //{field: 'modOn', header: 'Modified On', sortField: 'modOn2'},
    //{field: 'modifier', header: 'Modified By'}
  ];
  private itemsPerPage: any = 15;
  private emptyMessage: string;
  public exportFields: any[] = ['name', 'documentDate', 'orgcode', 'ecmno', 'creator', 'addOn', 'format'];
  @ViewChild(SearchDocumentComponent) searchDocComponent: SearchDocumentComponent;
  public busy: boolean;
  public searchResultCopy: any[] = [];
  public isLastPage = false;
  searchpageSize: any;
  searchCountLimit: any;
  @ViewChildren(DataTableComponent) dataTableComponentRef: QueryList<DataTableComponent>;
  @ViewChild('dt') dataTable: SharedDataTableModule;
  constructor(private breadcrumbService: BreadcrumbService, private us: UserService,private toastr:ToastrService,
    private documentService: DocumentService, private route: ActivatedRoute,
    private browserEvents: BrowserEvents, private coreService: CoreService,
    private cs: ContentService, private growlService: GrowlService, private as: AdminService) {
    this.currentUser = this.us.getCurrentUser();
    this.searchpageSize = globalv.search_page_size;
  }

  ngOnInit() {
    this.as.getConfiguration().subscribe(d => {
      this.searchCountLimit = d.value;
    });
    this.breadcrumbService.setItems([
      { label: 'Search' },
      { label: 'Simple Search' }
    ]);
    this.emptyMessage = global.no_doc_found;
    this.searchObj = {
      documentClasses: [], 
      searchTemplate: undefined, 
      model: {
        name: 'KOC Document', 
        symName: 'KOCDocument', 
        type: 'Document', 
        props: [],
        contentSearch: { 
          name: 'Content', 
          symName: 'CONTENT', 
          dtype: 'STRING', 
          mvalues: [] 
        }
      }, 
      actionTypes: [{ 
        label: 'Default', 
        value: 'Default' 
      }, { 
        label: 'Signature', 
        value: 'Signature' 
      }, { 
        label: 'Initial',
        value: 'Initial' 
      }],
      matchTypes: [{ 
        label: 'Exact match', 
        value: 'EXACT' 
      }, { 
        label: 'All of the words', 
        value: 'ALL' 
      }],
      maxRowLimit: 250, 
      isCurrent: true, 
      isSimpleSearch: true
    };

    this.route.paramMap.subscribe((params: any) => {
      this.isSearchSelected = true;
      if (this.selectedItem.length > 0) {
        this.refresh(this.selectedItem);
      }
      if (params.params.query && params.params.oper) {
        this.searchObj.model.contentSearch.mvalues[0] = params.params.query;
        this.searchObj.model.contentSearch.oper = params.params.oper;
        //this.browserEvents.onSearchTextChanged(params);
      } else {
        this.searchObj.model.contentSearch.mvalues[0] = [];
        this.searchObj.model.contentSearch.oper = '';
        //this.browserEvents.onSearchTextChanged(params);
      }
    });
    // this.us.getUserSettings().subscribe(val =>{
    //   this.assignPagination(val)});
    this.browserEvents.changeFilterText.subscribe(data => {
      this.refresh(data)
    }, Error => {
    });
  }

  assignPagination(val) {
    if (val !== undefined) {
      val.map((d, i) => {
        if (d.key === 'Page Size') {
          if (d.val !== '' && d.val) {
            this.itemsPerPage = JSON.parse(d.val);
            this.searchObj.pageSize = 50;
          } else {
            this.itemsPerPage = 15;
            this.searchObj.pageSize = 50;
          }
        }
      });
    }
  }

  /**
   * called on paging search complete
   * @param data
   */
  onSearchComplete(d) {
    // this.cs.saveSearchForPagination=[];
    this.documentService.savedSearch.simpleSearchText = this.searchObj.model.contentSearch.mvalues[0];
    this.documentService.savedSearch.searchCriteria = this.searchObj.model.contentSearch.oper;
    // this.selectedIndex = 1;
    if (this.selectedItem.length > 0) {
      this.refresh(this.selectedItem);
    }
    this.isSearchSelected = false;
    this.searchResultCopy = d.dataCopy;
    //this.cs.saveSearchForPagination.push(d.fullData);
    this.isLastPage = d.fullData.continueData === 'bnVsbA==';
  }

  /**
   * called on every search button click
   * @param searchResult
   */
  updateSearchResultCopy(searchResult) {
    this.searchResultCopy = searchResult;
  }

  onTabOpen(e) {
    this.isSearchSelected = (e.index === 0);
  }

  addToCart(doc) {
    this.busy = true;
    this.documentService.addToCart(this.currentUser.EmpNo, doc.id).subscribe(res => {
      this.busy = false;
      window.parent.postMessage({ v1: 'AddCartSuccess', v2: 1 }, '*');
    }, Error => {
      this.busy = false;
    });
  }

  downloadDoc(doc) {
    window.location.assign(this.documentService.downloadDocument(doc.id));
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  exportToExcel() {
    this.busy = true;
    this.documentService.exportSearchResult(
      /*{
      continueData: this.searchObj.continueData,
      skip: 0,
      pageSize: 0
      }*/
      this.searchResultCopy
    ).subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: 'application/vnd.ms-excel' });
      const fileName = 'search-result' + '-' + this.coreService.getDateTimeForExport() + '.xlsx';
      saveAs(file, fileName);
    }, Error => {
      this.busy = false;
    });
  }

  toggle() {
    //this.sideMenu.toggle();
  }

  getData(data: any, sidemenu?) {
    this.sideMenu = sidemenu;
    this.selectedItem = data;
    if (data !== null && data !== undefined) {
      // if (data.length === 0 && sidemenu.isOpened) {
      //   sidemenu.toggle();
      // }
      // if (data.length >= 1 && !sidemenu.isOpened) {
      //   sidemenu.show();
      // }
    }
  }

  changeTab(e) {
    // this.selectedIndex = e.index;
    if (this.selectedItem.length > 0) {
      this.refresh(this.selectedItem);
    }
  }

  refresh(docs) {
    let loop = 0;
    docs.map((d, i) => {
      loop++;
      if (loop === docs.length) {
        docs.splice(0, docs.length);
        // if (this.sideMenu.isOpened) {
        //   this.sideMenu.toggle();
        // }
      }
    });
  }

  getBrowseUpdated(docs) {
    const folderId = this.documentService.addToFolderId;
    this.cs.validateFolderPermissions(folderId, "ADD").subscribe(data => this.checkFolderPermission(data, docs, folderId));
  }

  checkFolderPermission(res, docs, folderId) {
    if (res === true) {
      let loop = 0;
      docs.map((d, i) => {
        this.subscriptions.push(this.cs.fileInFolder(folderId, d.id)
          .subscribe(data => {
            if (data === 'OK') {
              // this.growlService.showGrowl({
              //   severity: 'info',
              //   summary: 'Success', detail: 'Document Added To Folder'
              // });
              this.toastr.info('Document Added To Folder', 'Success');
              loop++;
              if (loop === docs.length) {
                docs.splice(0, docs.length);
              }
            } else if (data === 'Exists') {
              // this.growlService.showGrowl({
              //   severity: 'error',
              //   summary: 'Already Exist', detail: 'Document Already Exist In Destination Folder'
              // });
              this.toastr.error('Document Already Exist In Destination Folder', 'Already Exist');
            } else {
              // this.growlService.showGrowl({
              //   severity: 'error',
              //   summary: 'Failure', detail: 'Add To Folder Failed'
              // });
              this.toastr.error('Add To Folder Failed', 'Failure');
            }
          }));
      });
    } else {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'No Permission', detail: 'User dont have permission to add'
      // });
      this.toastr.error('User dont have permission to add', 'No Permission');
    }
  }

  /*  /!**
     * perform search on sorting and paging
     * @param event
     *!/
    continueSearch(event) {
      const pageNo = Math.ceil(event.first / event.rows) + 1;
      const skip = this.searchObj.pageSize * (pageNo - 1);
      if (!event || !event.rows) {
        return;
      }
      else if (event && event.globalFilter && event.globalFilter.trim()) {
        this.searchObj.searchResult = this.getFilterRecords(this.searchResultCopy, event.globalFilter.trim());
        this.searchObj.totalResults = this.searchObj.searchResult.length;
        return;
      }
      else if (event.sortField !== undefined) {
        this.searchObj.model.orderBy = event.sortField;
        if (event.sortOrder === 1) {
          this.searchObj.model.ascdesc = 'ASC';
        } else {
          this.searchObj.model.ascdesc = 'DESC';
        }
        this.searchObj.model.skip = skip;
        this.searchDocComponent.assignSortNotPaginationSimple();
      } else if (skip === 0) {
        this.searchDocComponent.assignSortNotPaginationSimple();
      } else {
        if (pageNo > 1) {
          this.busyModel = this.documentService.continueSearch(
            {
              continueData: this.searchObj.continueData,
              skip: skip,
              pageSize: this.searchObj.pageSize
            }).subscribe(data => {
            this.searchObj.continueData = data.continueData;
            data.row.map(d => {
              d.name = this.coreService.getPropValue(d.props, 'DocumentTitle');
              d.documentDate = this.coreService.getPropValue(d.props, 'DocumentDate');
              d.orgcode = this.coreService.getPropValue(d.props, 'OrgCode');
              d.ecmno = this.coreService.getPropValue(d.props, 'ECMNo');
            });
            this.searchObj.searchResult = data.row;
            //this.onSearchComplete.emit();
            this.searchResultCopy = _.cloneDeep(data.row);
          });
          //this.coreService.progress = {busy: this.busyModel, message: ''};
          this.addToSubscriptions(this.busyModel);
        }
      }
    }

    /!**
     * get filtered records from search results
     * @param searchResultCopy
     * @param searchText
     *!/
    getFilterRecords(searchResultCopy, searchText) {
      if (!searchText) {
        return this.searchResultCopy;
      }
      let searchedRecords = [];
      searchText = searchText.toLowerCase();
      let self = this, title, orgCode, ecmNo, docDate;
      _.map(this.searchResultCopy, function (record) {
        title = self.coreService.getPropValue(record.props, 'DocumentTitle'),
          orgCode = self.coreService.getPropValue(record.props, 'OrgCode'),
          docDate = self.coreService.getPropValue(record.props, 'DocumentDate'),
          ecmNo = self.coreService.getPropValue(record.props, 'ECMNo');
        if ((!!title && title.toLowerCase().indexOf(searchText) > -1) ||
          (!!orgCode && orgCode.toLowerCase().indexOf(searchText) > -1) ||
          (!!ecmNo && ecmNo.toLowerCase().indexOf(searchText) > -1) ||
          (!!docDate && docDate.toLowerCase().indexOf(searchText) > -1) ||
          (!!record.creator && record.creator.toLowerCase().indexOf(searchText) > -1) ||
          (!!record.addOn && record.addOn.toLowerCase().indexOf(searchText) > -1)) {
          searchedRecords.push(record);
        }
      });
      return searchedRecords;
    }*/

  strikeDeletedItem(id) {
    let index = _.findIndex(this.searchObj.searchResult, function (o: any) { return o.id === id; });
    if (index != -1) {
      this.searchObj.searchResult[index].isDeleted = true;
    }
    let j = _.findIndex(this.searchResultCopy, function (o) { return o.id === id; });
    if (j != -1) {
      this.searchResultCopy.splice(j, 1);
    }
  }

  getFilteredItems(filteredItems) {
    const filteredDoc = _.filter(JSON.parse(JSON.stringify(filteredItems)), function (o) { return !o.isDeleted; });
    this.searchResultCopy = this.coreService.UnInterceptContentSearchResults(filteredDoc);
  }

  getRowTrackBy = (index, item) => {
    return item.id;
  };

  getPaginationInfoSearch(dat) {
    this.isLastPage = true;
    this.busy = true;
    let goToPage = this.searchCountLimit;//to use searchpagesize comment the below line
    this.searchpageSize = undefined;
    let postdata = { continueData: '', pageSize: '200', skip: 0 };
    postdata.continueData = this.searchObj.continueData;
    this.documentService.continueSearch(postdata).subscribe(data => {
      //this.as.getSearchDataFinal().subscribe(data=>{
      // console.log(this.cs.saveSearchForPagination);
      // this.cs.saveSearchForPagination.push(data);
      // console.log(this.cs.saveSearchForPagination);
      //this.searchObj=this.cs.saveSearchForPagination.resultdata;
      this.searchObj.totalResults = this.searchObj.totalResults + data.totalResults;
      if (data.row.length > 0) {
        data.row.map(d => {
          d.name = d.props ? this.coreService.getPropValue(d.props, 'DocumentTitle') : ' ';
          d.documentDate = d.props ? this.coreService.getPropValue(d.props, 'DocumentDate') : ' ';
          d.orgcode = d.props ? this.coreService.getPropValue(d.props, 'OrgCode') : ' ';
          d.ecmno = d.props ? this.coreService.getPropValue(d.props, 'ECMNo') : ' ';
          d.referenceNo = d.props ? this.coreService.getPropValue(d.props, 'ReferenceNo') : ' ';
          d.documentDate2 = d.documentDate ? this.coreService.getTimestampFromDate(d.documentDate, this.coreService.dateTimeFormats.DDMMYYYY, '/') : ' ';
          d.addOn2 = d.addOn ? this.coreService.getTimestampFromDate(d.addOn, this.coreService.dateTimeFormats.DDMMYYYYhhmmA, '/') : ' ';
        });
      }
      data.row.map(k => {
        this.searchObj.searchResult.push(k);
      });
      this.searchObj.searchResult = [...this.searchObj.searchResult];
      let copyresult = _.cloneDeep(this.searchObj.searchResult);
      this.searchResultCopy = this.coreService.UnInterceptContentSearchResults(copyresult);
      console.log(this.searchResultCopy);
      this.searchObj.continueData = data.continueData;
      if (data.continueData === 'bnVsbA==') {
        this.isLastPage = true;
        goToPage = this.searchObj.totalResults - data.totalResults;
      }
      else {
        this.isLastPage = false;
        if (this.searchObj.totalResults >= (goToPage * 2)) {
          goToPage = this.searchObj.totalResults - goToPage;
        }
      }
      this.busy = false;
      this.browserEvents.setPageNoOnLoadMore.emit(goToPage);

    });
  }

  ngOnDestroy() {
    this.isSearchSelected = true;
    this.coreService.isAdvanced = 'N';
    this.searchObj = {};
    this.clearSubscriptions();
  }
}