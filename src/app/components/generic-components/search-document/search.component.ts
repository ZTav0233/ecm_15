import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit, ElementRef, ViewChild
} from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { BrowserEvents } from '../../../services/browser-events.service';
import { CoreService } from '../../../services/core.service';
import { GrowlService } from "../../../services/growl.service";
import { UserService } from "../../../services/user.service";
import { User } from "../../../models/user/user.model";
import { ConfirmationService, LazyLoadEvent, Message } from "primeng/api";
import { Table } from 'primeng/table';

import * as _ from "lodash";
import { ContentService } from "../../../services/content.service";
import { Router } from "@angular/router";
import { AdminService } from "../../../services/admin.service";
import * as global from "../../../global.variables";
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
@Component({
  styleUrls: ['./search.component.css'],
  selector: 'app-search-document',
  templateUrl: './search.component.html'
})
export class SearchDocumentComponent implements OnInit, OnDestroy {
  //private savedSearches: any[] = [];
  public showSaveSearchModal = false;
  saveSearchObj: any = {};
  private user: User;
  @Input() public data: any;
  @Input() public isSimpleSearch = true;
  @Output() existsInList = new EventEmitter();
  @Output() onSearchComplete = new EventEmitter();
  @Output() updateSearchResultCopy = new EventEmitter();
  public dynamicProps: any;
  private subscriptions: any = [];
  @Input() showSavedSearches = false;
  @Input() dataTableComponentRef: any;
  @Input() screen;
  @Input() usage;
  @Input() isLaunchSearch = false;
  public selectedSearch: any;
  public savedSearchesHidden = false;
  public searchAlreadyExists = false;
  temparray: any[];
  isClassChange = false;
  public busy: boolean;
  public busySearchPagination: boolean;
  //{label: '=', value: 'is equal to'},
  //operDate: any = [{ label: '>=', value: '>=' }, { label: '<=', value: '<=' }, { label: 'bet', value: 'between' }];
  operDate: any = [{ label: 'bet', value: 'between' }];
  operFields = [{ label: '=', value: 'is equal to' },
  { label: '≃', value: 'contains' }];
  operLookup = [{ label: '=', value: 'is equal to' }];
  operInteger = [{ label: '=', value: 'is equal to' }, { label: '≠', value: 'is not equal to' }];
  public userSearchSuggestion;
  public createdByFieldSearch = false;
  docToOrFrom: any;
  designation: any;
  selectedDesignation: any;
  et_dependent_lookup: any;
  totalRecords: number;
  datasource: any;
  showDesignation = false;
  public excepClassNames = global.excep_class_names;
  searchResultData: any;
  @ViewChild('gb') searchInput: ElementRef;
  maxToCreated: any;
  minFromCreated: any;
  today: any;
  searchButtonDisabledStopWord: any = true;
  msgs: Message[] = [];
  stopwordmessageGlobal: any;
  constructor(public documentService: DocumentService,private toastr:ToastrService,
    private browserEvents: BrowserEvents, private coreService: CoreService,
    private growlService: GrowlService, private userService: UserService,
    private confirmationService: ConfirmationService, private contentService: ContentService,
    public router: Router, private adminService: AdminService) {
      this.et_dependent_lookup = global.et_dependent_lookup;
  }

  ngOnInit() {
    this.stopwordmessageGlobal = global.stop_word_message;
    this.maxToCreated = new Date();
    this.minFromCreated = new Date('1900-01-01');
    this.today = new Date();
    this.user = this.userService.getCurrentUser();
    this.searchResultData = JSON.parse(sessionStorage.getItem("searchResultsSaved"));
    let searcharray = JSON.parse(sessionStorage.getItem("savedSearch"));
    if (!searcharray) {
      sessionStorage.setItem("savedSearch", JSON.stringify({
        advanceSearchSaved: [],
        documentClassSaved: {}, selectedSavedSearchObj: undefined, isCurrentVersion: undefined,
        maxResult: undefined, simpleSearchText: undefined, searchCriteria: undefined, et: undefined, ets: undefined
      }));
      searcharray = JSON.parse(sessionStorage.getItem("savedSearch"));
    }
    if (this.isSimpleSearch) {
      // if (this.data.model.contentSearch.mvalues[0] !== [] && this.data.model.contentSearch.oper) {
      //   searcharray.simpleSearchText = this.data.model.contentSearch.mvalues[0];
      //   searcharray.searchCriteria = this.data.model.contentSearch.oper;
      //   this.validateStopWord(this.data.model.contentSearch.mvalues[0], '1');
        
      // }
      if (this.data.model.contentSearch.mvalues[0].length > 0 && this.data.model.contentSearch.oper) {
        searcharray.simpleSearchText = this.data.model.contentSearch.mvalues[0];
        searcharray.searchCriteria = this.data.model.contentSearch.oper;
        this.validateStopWord(this.data.model.contentSearch.mvalues[0], '1');
    }
    
    } else {
      this.getEntryTemplateForSearch();
    }
    /*const eventSubscription = this.browserEvents.searchTextChanged$.subscribe(params => {
      if (this.data) {
        if (!this.isSimpleSearch || (this.data.model.contentSearch.mvalues[0] !== [] && this.data.model.contentSearch.oper)) {
          console.log("search text changed from header");
          this.searchDocument(true);
          //eventSubscription.unsubscribe();
        }
      }
    });*/
    this.getSavedSearches(true);
    if (this.searchResultData && !this.isLaunchSearch) {
      this.data.continueData = this.searchResultData.continueData;
      this.data.totalResults = this.searchResultData.totalResults;
      this.data.searchResult = this.searchResultData.row;
    }
    if (searcharray && !this.isLaunchSearch) {
      if (searcharray.simpleSearchText && !this.isLaunchSearch) {
        this.data.model.contentSearch.mvalues[0] = searcharray.simpleSearchText;
      }
      if (searcharray.searchCriteria && !this.isLaunchSearch) {
        this.data.model.contentSearch.oper = searcharray.searchCriteria;
      }
      if (searcharray.selectedSavedSearchObj && !this.isLaunchSearch) {
        this.selectSearch(searcharray.selectedSavedSearchObj);
      }
      if (searcharray.isCurrentVersion !== undefined && !this.isLaunchSearch) {
        this.data.isCurrent = searcharray.isCurrentVersion;
      }
      if (searcharray.maxResult && !this.isLaunchSearch) {
        this.data.maxRowLimit = searcharray.maxResult;
      }
    }
    //let desigData = JSON.parse(localStorage.getItem('designationJSON'));
    let desigData;
    if (this.adminService.designationValues && this.adminService.designationValues.length <= 0) {
      //AKV-getDesignationValues
        this.adminService.getDesignationData().subscribe(data => {
        this.adminService.designationValues = data;
        this.adminService.designationValues.unshift({ id: "", value: null, action: "" });
        this.assignDesignationData(this.adminService.designationValues);
      }, err => {
        console.log(err)
      });
    }
    else {
      desigData = this.adminService.designationValues;
      this.assignDesignationData(desigData);
    }
  }

  assignDesignationData(desigData) {
    if (desigData && desigData.length > 0) {
      this.designation = desigData;
      this.datasource = this.designation;
      this.totalRecords = this.datasource.length;
      this.designation = this.datasource//.slice(0, 10);
    }
  }

  loadLazy(event: LazyLoadEvent, table: Table) {
    if (event.globalFilter.length > 0) {
      this.designation = this.datasource.filter(
        item => item.value ? item.value.toLowerCase().indexOf(event.globalFilter.toLowerCase()) != -1 : "");
      this.totalRecords = this.designation.length;
    }
    else {
      setTimeout(() => {
        if (this.datasource) {
          this.designation = this.datasource//.slice(event.first, (event.first + event.rows));
          this.totalRecords = this.datasource.length;
        }
      }, 250);
    }
  }

  openListDialog(detail) {
    this.showDesignation = true;
    this.searchInput.nativeElement.value = '';
    this.selectedDesignation = [];
    if (detail === 'DocumentTo') {
      this.docToOrFrom = 'Document To';
    }
    else {
      this.docToOrFrom = 'Document From';
    }
  }

  onSelectionChange(val, input) {
    if (input === 'Document To') {
      this.dynamicProps.map(d => {
        if (d.selectedOption.symName === 'DocumentTo') {
          d.mvalues[0] = (val.data.value);
        }
      })
    }
    else {
      this.dynamicProps.map(d => {
        if (d.selectedOption.symName === 'DocumentFrom') {
          d.mvalues[0] = (val.value);
        }
      })
    }
  }

  operChanged(obj) {
    if (obj.selectedOption.dtype.toLowerCase() === 'date' && obj.mvalues[1]) {
      obj.mvalues[1] = undefined;
    }
  }

  closeSaveSearchModal() {
    this.showSaveSearchModal = false;
  }

  onSaveSearchModalHide() {
    this.saveSearchObj = {};
  }

  changeProp(desc) {
    this.data.searchTemplate.props.map((prop) => {
      if (prop.desc === desc) {
        prop.show = false;
      }
    })
  }

  addDynamicProp(selectedProp?, oper?) {
    const propArr = [];
    let sProp;
    this.data.searchTemplate.props.map((prop) => {
      if ((!prop.selected || (selectedProp && prop.symName === selectedProp.symName)) && prop.hidden.toLowerCase() === 'false'
        && prop.dtype.toLowerCase() !== 'object') {
        propArr.push({
          label: prop.desc.length > 0 ? prop.desc : prop.symName,
          value: {
            dtype: prop.dtype,
            symName: prop.symName,
            ltype: prop.ltype,
            lookups: this.getLookupValues(prop),
            operFields: this.getOperators(prop),
            oper: oper ? oper : this.getDefaultOperatorValue(prop)
          }
        })
      }
      if (selectedProp && prop.symName === selectedProp.symName) {
        prop.selected = true;
        sProp = propArr[propArr.length - 1];
      }
    });
    if (!propArr[propArr.length - 1]) {
      return;
    }
    if (this.selectedSearch && selectedProp) {
      // console.log("prp arr " + JSON.stringify(propArr));
      this.dynamicProps.push({
        options: propArr,
        selectedOption: sProp.value,
        mvalues: selectedProp.mvalues
      });
    }
    else {
      this.dynamicProps.push({
        options: propArr,
        selectedOption: propArr[0].value,
        mvalues: []
      });
    }

    if (!this.selectedSearch || !selectedProp) {
      this.data.searchTemplate.props.map((prop, k) => {
        if (prop.symName === propArr[0].value.symName) {
          prop.selected = true;
        }
      });
    }
    this.updatePropOptions();
  }

  clearSearch() {
    if (this.isSimpleSearch) {
      if (this.data.model.contentSearch.mvalues[0]) {
        this.data.model.contentSearch.mvalues = [];
      }
    }
    else {
      this.data.model.contentSearch.mvalues = [];
      this.dynamicProps.map(d => {
        d.mvalues = [];
        //d.oper=d.operFields[0].value;
        d.selectedOption.oper = d.selectedOption.operFields[0].value;
        if (d.selectedOption.symName.toLowerCase() === 'documenttitle')
          d.selectedOption.oper = d.selectedOption.operFields[1].value;

        if (d.selectedOption.symName === 'DateCreated') {
          d.mvalues[1] = new Date();
          d.mvalues[0] = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
        }
      });
    }
    this.createdByFieldSearch = false;
    this.data.isCurrent = true;
    this.data.maxRowLimit = 250;
    this.data.totalResults = 0;
    this.data.searchResult = [];
    this.msgs = [];
    if (!this.isLaunchSearch) {
      //this.documentService.savedSearch.searchResultsSaved = { continueData: undefined, totalResults: 0, row: [] };
      sessionStorage.setItem("searchResultsSaved", JSON.stringify({ continueData: undefined, totalResults: 0, row: [] }));
    }
    //this.onSearchComplete.emit({data: this.data.searchResult, dataCopy: _.cloneDeep(this.data.searchResult)});
    this.updateSearchResultCopy.emit([]);
  }

  addAllProperties(selectedProp?) {
    let propArr = [];
    let sProp;
    this.data.searchTemplate.props.map((prop, index) => {
      if (!prop.selected && prop.hidden.toLowerCase() === 'false' && prop.dtype.toLowerCase() !== 'object') {
        propArr = [{
          label: prop.desc.length > 0 ? prop.desc : prop.symName, value: {
            dtype: prop.dtype,
            symName: prop.symName,
            ltype: prop.ltype,
            lkpId: prop.lkpId,
            lookups: this.getLookupValues(prop),
            operFields: this.getOperators(prop),
            oper: this.getDefaultOperatorValue(prop)
          }
        }];
        prop.selected = true;
        this.dynamicProps.push({
          options: propArr,
          selectedOption: propArr[0].value,
          mvalues: []
        });
      }
    });
    if (!propArr[propArr.length - 1]) {
      return;
    }
    let searcharray = JSON.parse(sessionStorage.getItem("savedSearch"));
    let isCreatedDateNotSaved = false;
    if (searcharray && searcharray.advanceSearchSaved && !this.isLaunchSearch) {
      let finalIndex = 0;
      searcharray.advanceSearchSaved.map((d, i) => {
        /*const index = this.dynamicProps.map(dProp => dProp.selectedOption.symName).indexOf(d.selectedOption.symName);
        if (index !== -1) {
          this.dynamicProps[index].mvalues = d.mvalues;
          this.dynamicProps[index].selectedOption.oper = d.selectedOption.oper;
        }*/
        let editedField = _.find(this.dynamicProps, ['selectedOption.symName', d.selectedOption.symName]);
        if (editedField) {
          if (d.selectedOption.dtype.toLowerCase() === 'date') {
            if (d.mvalues[0]) {
              editedField.mvalues[0] = new Date(d.mvalues[0]);
            }
            if (d.mvalues[1]) {
              editedField.mvalues[1] = new Date(d.mvalues[1]);
            }
            if ((d.mvalues[0] && d.mvalues[0].length === 0) || (d.mvalues[1] && d.mvalues[1].length === 0)) {
              isCreatedDateNotSaved = true;
            }
          }
          else {
            editedField.mvalues = d.mvalues;
          }
          editedField.selectedOption.oper = d.selectedOption.oper;
        }
        //this.dynamicProps[i].mvalues = d.mvalues;
        if (searcharray.advanceSearchSaved.length === finalIndex + 1) {
          if (searcharray.advanceSearchSaved.length === 0 || !isCreatedDateNotSaved) {
            this.dynamicProps.map(d => {
              if (d.selectedOption.symName === 'DateCreated') {
                d.mvalues[1] = new Date();
                d.mvalues[0] = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
              }
            })
          }
        }
        finalIndex++;
      });
      if (searcharray.advanceSearchSaved.length === 0 || isCreatedDateNotSaved) {
        this.dynamicProps.map(d => {
          if (d.selectedOption.symName === 'DateCreated') {
            d.mvalues[1] = new Date();
            d.mvalues[0] = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
          }
        })
      }
    }
    else {
      this.dynamicProps.map(d => {
        if (d.selectedOption.symName === 'DateCreated') {
          d.mvalues[1] = new Date();
          d.mvalues[0] = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
        }
      })
    }
    this.updatePropOptions();
  }

  updatePropOptions() {
    this.dynamicProps.map((dynamicProp, i) => {
      dynamicProp.options.map((option, j) => {
        this.data.searchTemplate.props.map((prop, k) => {
          if (!prop.selected && prop.hidden.toLowerCase() === 'false' && prop.dtype.toLowerCase() !== 'object') {
            if (dynamicProp.options.map(opt => opt.value.symName).indexOf(prop.symName) === -1) {
              dynamicProp.options.push({
                label: prop.desc.length > 0 ? prop.desc : prop.symName,
                value: {
                  dtype: prop.dtype, symName: prop.symName, ltype: prop.ltype, lookups: this.getLookupValues(prop),
                  operFields: this.getOperators(prop), oper: this.getDefaultOperatorValue(prop)
                }
              });
            }
          } else if (prop.symName !== dynamicProp.selectedOption.symName) {
            if (dynamicProp.options.map(opt => opt.value.symName).indexOf(prop.symName) !== -1) {
              dynamicProp.options.splice(dynamicProp.options.map(opt => opt.value.symName).indexOf(prop.symName), 1);
            }
          }
        })
      })
    })
  }

  propChanged(index) {
    this.dynamicProps[index].mvalues = [];
    this.setSelection();
    this.updatePropOptions();
  }

  setSelection() {
    this.data.searchTemplate.props.map((prop, k) => {
      if (this.dynamicProps.map(dProp => dProp.selectedOption.symName).indexOf(prop.symName) === -1) {
        prop.selected = false;
      } else {
        prop.selected = true;
      }
    });
  }

  removeProp(index) {
    if (this.dynamicProps[index].selectedOption.symName.toLowerCase() === 'creator') {
      this.createdByFieldSearch = false;
      this.data.isCurrent = true;
    }
    this.dynamicProps.splice(index, 1);
    this.setSelection();
    this.updatePropOptions();
  }

  getEntryTemplateForSearch() {
    this.data.documentClasses = [];
    let searcharray = JSON.parse(sessionStorage.getItem("savedSearch"));
    if (searcharray && searcharray.documentClassSaved && searcharray.documentClassSaved.id && !this.isLaunchSearch) {
      this.data.documentClasses = searcharray.et;
      this.data.model.selectedDocumentClass = searcharray.documentClassSaved;
      this.getEntryTemplateForSearchId(this.data.model.selectedDocumentClass);
    }
    else {
      //Combining getEntryTemplatesForSearch and getEntryTemplates API Call.
      //this.screen && this.screen === 'Launch'
      if (this.contentService.entryTemplatesListForSearchAndAdd
        && this.contentService.entryTemplatesListForSearchAndAdd.searchList.length > 0) {
        let searchEntryTemplate = this.contentService.entryTemplatesListForSearchAndAdd.searchList;
        searchEntryTemplate.map((d) => {
          this.data.documentClasses.push({ value: { 'id': d.id, 'vsid': d.vsid, 'etName': d.name }, label: d.symName });
        });
        this.data.model.selectedDocumentClass = { 'id': searchEntryTemplate[0].id, 'vsid': searchEntryTemplate[0].vsid, 'etName': searchEntryTemplate[0].name };
        if (searchEntryTemplate[0]) {
          this.getEntryTemplateForSearchId(this.data.documentClasses[0].value);
        }
      } else {
        this.busy = true;
        this.contentService.getEntryTemplatesForSearchAndAdd().subscribe(data => {
          this.busy = false;
          this.contentService.entryTemplatesListForSearchAndAdd.addList = data.addList;
          this.contentService.entryTemplatesListForSearchAndAdd.searchList = data.searchList;
          this.contentService.entryTemplatesListForSearchAndAdd.valueFetchedFromServer = true;
          data.searchList.map((d) => {
            this.data.documentClasses.push({ value: { 'id': d.id, 'vsid': d.vsid, 'etName': d.name }, label: d.symName });
          });
          this.data.model.selectedDocumentClass = this.data.documentClasses[0].value;
          if (this.data.documentClasses[0]) {
            this.getEntryTemplateForSearchId(this.data.documentClasses[0].value);
          }
        }, err => {
          this.busy = false;
        });
      }
    }
  }

  getEntryTemplateForSearchId(value) {
    this.dynamicProps = [];
    // if(!this.isClassChange && this.documentService.savedSearch.ets.props && !this.selectedSearch){
    //   this.data.searchTemplate =this.documentService.savedSearch.ets;
    //    if (this.data.model.contentSearch.mvalues[0] && this.data.model.contentSearch.oper
    //       && this.isSimpleSearch) {
    //       this.searchDocument(true);
    //     }
    //      this.addAllProperties();
    // }
    // else {
    let template;
    template = _.find(this.contentService.entryTemplatesListForSearchAndAdd.entryTemplateForSearch, (template) => {
      // template = _.find(sessionStorage.getItem("template"), (template) => {
      return template.template.id === value.id && template.template;
    });
    if (template) {
      this._assignTemplateFromMemory(_.cloneDeep(template.template));
    } else {
      this.busy = true;
      this.contentService.getEntryTemplateForSearchId(value.id, value.vsid).subscribe(data => {
        this.busy = false;
        this.data.searchTemplate = data;
        this.contentService.entryTemplatesListForSearchAndAdd.entryTemplateForSearch.push({ 'template': _.cloneDeep(data) });
        if (this.selectedSearch) {
          this.data.searchTemplate.props.map((p, i) => {
            //p.dtype.toLowerCase() === 'date'? p.operFields=this.operDate : p.operFields=this.operFields;
            const index = this.selectedSearch.searchTemplate.props.map(dProp => dProp.symName).indexOf(p.symName);
            if (index !== -1) {
              const elm = this.selectedSearch.searchTemplate.props[index];
              if (elm.mvalues[0]) {
                p.mvalues = [];
                if (elm.dtype.toLowerCase() === 'date') {
                  p.mvalues[0] = new Date(elm.mvalues[0]);
                  if (elm.symName === 'DateCreated') {
                    p.mvalues[0] = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
                  }
                } else {
                  p.mvalues[0] = elm.mvalues[0];
                }
              }
              if (elm.mvalues[1]) {
                if (elm.dtype.toLowerCase() === 'date') {
                  p.mvalues[1] = new Date(elm.mvalues[1]);
                  if (elm.symName === 'DateCreated') {
                    p.mvalues[1] = new Date();
                  }
                } else {
                  p.mvalues[1] = elm.mvalues[1];
                }
              }
              //p.oper=elm.oper;
              this.addDynamicProp(p, elm.oper);
            } else {
              //p.oper=p.operFields[0].value;
            }
          });
        } else {
          //this.addDynamicProp();
          this.addAllProperties();
        }
        //console.log("data "+JSON.stringify(data));
        if (this.data.model.contentSearch.mvalues[0] && this.data.model.contentSearch.oper
          && this.isSimpleSearch) {
          this.searchDocument(false);
        }
      }, err => {
        this.busy = false;
      });
      // }
    }
  }

  _assignTemplateFromMemory(data) {
    this.data.searchTemplate = data;
    if (this.selectedSearch) {
      this.data.searchTemplate.props.map((p, i) => {
        //p.dtype.toLowerCase() === 'date'? p.operFields=this.operDate : p.operFields=this.operFields;
        const index = this.selectedSearch.searchTemplate.props.map(dProp => dProp.symName).indexOf(p.symName);
        if (index !== -1) {
          const elm = this.selectedSearch.searchTemplate.props[index];
          if (elm.mvalues[0]) {
            p.mvalues = [];
            if (elm.dtype.toLowerCase() === 'date') {
              p.mvalues[0] = new Date(elm.mvalues[0]);
            } else {
              p.mvalues[0] = elm.mvalues[0];
            }
          }
          if (elm.mvalues[1]) {
            if (elm.dtype.toLowerCase() === 'date') {
              p.mvalues[1] = new Date(elm.mvalues[1]);
            } else {
              p.mvalues[1] = elm.mvalues[1];
            }
          }
          //p.oper=elm.oper;
          this.addDynamicProp(p, elm.oper);
        } else {
          //p.oper=p.operFields[0].value;
        }
      })
    } else {
      //this.addDynamicProp();
      this.addAllProperties();
    }
    //console.log("data "+JSON.stringify(data));
    if (this.data.model.contentSearch.mvalues[0] && this.data.model.contentSearch.oper
      && this.isSimpleSearch) {
      this.searchDocument(false);
    }
  }

  switchDocumentClass() {
    this.selectedSearch = undefined;
    this.data.model.contentSearch.mvalues = [];
    this.dynamicProps = [];
    this.isClassChange = true;
    if (!this.isLaunchSearch) {
      JSON.parse(sessionStorage.getItem("savedSearch")).advanceSearchSaved = [];
      //sessionStorage.savedSearch.advanceSearchSaved = [];
    }
    this.getEntryTemplateForSearchId(this.data.model.selectedDocumentClass);
  }

  fromDateChanged(dynamicProp) {
    const d = new Date(dynamicProp.mvalues[0]);
    d.setDate(d.getDate());
    dynamicProp.minDate = d;
  }

  fromDateChangedCreated(dynamicProp) {
    const d = new Date(dynamicProp.mvalues[0]);
    const temp = new Date(dynamicProp.mvalues[0]);
    const temp2 = dynamicProp.mvalues[1] ? new Date(dynamicProp.mvalues[1]) : null;
    d.setDate(d.getDate());
    this.maxToCreated = new Date(d.setFullYear(d.getFullYear() + 5));
    if (dynamicProp.mvalues[1] && dynamicProp.mvalues[0] && this.getYearDifference(dynamicProp.mvalues[0], dynamicProp.mvalues[1]) >= 5) {
      dynamicProp.mvalues[1] = new Date(temp.setFullYear(temp.getFullYear() + 5));
    }
    if (temp2 == null || (temp2 != null && moment((temp), "DD/MM/YYYY").toDate() > moment((temp2), "DD/MM/YYYY").toDate())) {
      dynamicProp.mvalues[1] = new Date(temp.setFullYear(temp.getFullYear() + 5));
    }
    const todatemin = new Date(dynamicProp.mvalues[0]);
    dynamicProp.minDate = todatemin;
    if (moment((this.maxToCreated), "DD/MM/YYYY").toDate() > moment((this.today), "DD/MM/YYYY").toDate()) {
      this.maxToCreated = this.today;
      if (dynamicProp.mvalues[1] && dynamicProp.mvalues[0] && this.getYearDifference(dynamicProp.mvalues[0], dynamicProp.mvalues[1]) >= 5) {
        dynamicProp.mvalues[1] = moment((this.today), "DD/MM/YYYY").toDate();
      }
    }
  }

  getYearDifference(initialdate, finaldate) {
    const year = moment(initialdate);
    return moment(finaldate).diff(year, 'years');
  };

  toDateChangedCreated(dynamicProp) {
    // const d = new Date(dynamicProp.mvalues[1]);
    // const temp = new Date(dynamicProp.mvalues[1]);
    // d.setDate(d.getDate());
    // dynamicProp.minDate = d;
    //this.minFromCreated=new Date(d.setFullYear(d.getFullYear() - 5));
    //dynamicProp.mvalues[0]=new Date(temp.setFullYear(temp.getFullYear() - 5));
  }

  onclearFromDate(d) {
    d.mvalues[1] = new Date();
    d.mvalues[0] = new Date(new Date().setFullYear(new Date().getFullYear() - 5));
  }

  mapDynamicPropToSearchTemplate(saveForSearch) {
    let req: any;
    if (this.isSimpleSearch) {
      req = Object.assign({}, this.data.model);
    } else {
      req = Object.assign({}, { contentSearch: this.data.model.contentSearch });
      if (!this.data.model.contentSearch.mvalues[0]) {
        req.contentSearch.mvalues[0] = "";
      }
      req.id = this.data.searchTemplate.id;
      req.name = this.data.searchTemplate.name;
      req.symName = this.data.searchTemplate.symName;
      req.vsid = this.data.searchTemplate.vsid;
      req.type = this.data.searchTemplate.type;
      req.props = [];
      this.data.searchTemplate.props.map((p, i) => {
        if (saveForSearch) {
          req.props[i] = { dtype: p.dtype, symName: p.symName };
        } else {
          req.props[i] = { dtype: p.dtype, symName: p.symName };
        }
        const index = this.dynamicProps.map(dProp => dProp.selectedOption.symName).indexOf(p.symName);
        req.props[i].mvalues = [];
        //console.log("index "+index+" prop "+p.symName);
        if (index !== -1) {
          if (this.dynamicProps[index].mvalues[0]) {
            req.props[i].oper = this.dynamicProps[index].selectedOption.oper;
            //console.log("found mvalues");
            if (p.dtype === 'DATE' && !saveForSearch) {
              const nDate = new Date(this.dynamicProps[index].mvalues[0]);
              if (req.props[i].oper === '<=') {
                nDate.setHours(23, 59, 0);
                nDate.setHours(nDate.getHours() - 3);
              } else {
                nDate.setHours(0, 0, 0);
                nDate.setHours(nDate.getHours() - 3);
              }
              req.props[i].mvalues[0] = this.coreService.formatDateForSearch(nDate);
              //req.props[i].oper = this.dynamicProps[index].oper;
              //console.log(req.props[i].oper);
            } else {
              //console.log("found mvalues string");
              req.props[i].mvalues[0] = this.dynamicProps[index].mvalues[0];
              //req.props[i].oper = this.dynamicProps[index].oper;
              if (this.dynamicProps[index].selectedOption.symName.toLowerCase() === 'creator' && typeof this.dynamicProps[index].mvalues[0] === 'object') {
                req.props[i].mvalues[0] = this.dynamicProps[index].mvalues[0].value;
              }
            }
          }
          if (this.dynamicProps[index].mvalues[1]) {
            if (p.dtype === 'DATE' && !saveForSearch) {
              const nDate = new Date(this.dynamicProps[index].mvalues[1]);
              nDate.setHours(23, 59, 0);
              nDate.setHours(nDate.getHours() - 3);
              req.props[i].mvalues[1] = this.coreService.formatDateForSearch(nDate);
              req.props[i].oper = "between";
            } else {
              req.props[i].mvalues[1] = this.dynamicProps[index].mvalues[1];
            }
          }
          if (!this.dynamicProps[index].mvalues[0] && p.dtype === 'DATE' && !saveForSearch) {
            req.props[i].mvalues[0] = undefined;
            req.props[i].mvalues[1] = undefined;
          }
        } else {
          req.props[i].mvalues[0] = null;
        }
      });
      //added on 14022019
      /*if (this.data.model.orderBy !== undefined) {
        req.orderBy = this.data.model.orderBy;
        req.ascdesc = this.data.model.ascdesc;
      }
      req.skip = resetPageNo ? 0 : this.data.model.skip;
      if (resetPageNo && this.dataTableComponentRef){
        this.dataTableComponentRef._results.map(r => {
          if (r.first>0)
            r.first = 0;
        });
      }*/
    }
    return req;
  }

  searchDocument(clearPreviousResults, flag?) {
    if (clearPreviousResults) {
      this.data.totalResults = 0;
      this.data.searchResult = [];
      if (!this.isLaunchSearch) {
        //this.documentService.savedSearch.searchResultsSaved = { continueData: undefined, totalResults: 0, row: [] };
        sessionStorage.setItem("searchResultsSaved", JSON.stringify({ continueData: undefined, totalResults: 0, row: [] }));
      }
      //this.onSearchComplete.emit({data: this.data.searchResult, dataCopy: _.cloneDeep(this.data.searchResult)});
      this.updateSearchResultCopy.emit([]);
    }
    let labelTemp;
    this.data.matchTypes.map(d => {
      if (d.value === this.data.model.contentSearch.oper) {
        labelTemp = d.label;
      }
    });
    window.parent.postMessage({
      'v1': 'searchText', 'v2': this.data.model.contentSearch.mvalues[0], 'v3': this.data.model.contentSearch.oper,
      'v4': labelTemp
    }, '*');
    if (!this.isSimpleSearch) {
      let noFilter = true;
      let isDateFieldsEmpty = false;
      if (this.data.model.contentSearch.mvalues[0]) {
        noFilter = false;
      }
      if (this.dynamicProps) {
        this.dynamicProps.map((p, i) => {
          if (p.mvalues[0]) {
            noFilter = false;
          }
          if (p.selectedOption.dtype === "DATE" && p.selectedOption.oper === "between") {
            if ((p.mvalues[0]) && !(p.mvalues[1])) {
              isDateFieldsEmpty = true;
            }
          }
        });
      }
      if (isDateFieldsEmpty) {
        // this.growlService.showGrowl({
        //   severity: 'error',
        //   summary: 'Invalid Search', detail: 'From Date and To Date Required'
        // });
        this.toastr.error('From Date and To Date Required', 'Invalid Search');
        return;
      }
      if (noFilter) {
        if (flag === 'isbutton') {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Invalid Search', detail: 'Fill atleast one field'
          // });
          this.toastr.error('Fill atleast one field', 'Invalid Search');
        }
        return;
      }
      if (flag === 'isbutton') {
        const req = this.mapDynamicPropToSearchTemplate(false);
        if (!this.isLaunchSearch) {
          JSON.parse(sessionStorage.getItem("savedSearch")).advanceSearchSaved = req.props;
        }
        req.pageSize = this.data.pageSize ? this.data.pageSize : 50;
        req.maxRowLimit = this.data.maxRowLimit ? this.data.maxRowLimit : 250;
        req.isCurrent = this.data.isCurrent;
        //req.isSimpleSearch = this.data.isSimpleSearch;
        this.callPagingSearch(req);
      }
    }
    else {
      const req = this.mapDynamicPropToSearchTemplate(false);
      req.pageSize = this.data.pageSize ? this.data.pageSize : 50;
      req.maxRowLimit = this.data.maxRowLimit ? this.data.maxRowLimit : 250;
      req.isCurrent = this.data.isCurrent;
      //req.isSimpleSearch = this.data.isSimpleSearch;
      this.callPagingSearch(req);
    }
  }

  searchIsEmpty() {
    let result = true;
    if (!this.isSimpleSearch) {
      if (this.data.model.contentSearch.mvalues[0]) {
        result = false;
      }
      if (this.dynamicProps) {
        this.dynamicProps.map((p, i) => {
          if (p.mvalues[0] && p.selectedOption.symName !== 'DateCreated') {
            result = false;
          }
        });
      }
    }
    return result;
  }

  /**
   * called on document search and on sorting.
   * @param req
   */
  callPagingSearch(req) {
    this.busySearchPagination = true;
    this.browserEvents.clearFilterAfterSearch.emit();
    this.documentService.icnSearch(req).subscribe(data => {
      //this.adminService.getSearchData().subscribe(data => {
      this.data.continueData = data.continueData;
      this.data.totalResults = data.totalResults;
      this.data.message = data.message && data.message === 'MaxCountLimit' ? data.message : undefined;//'Count Limit Exceeded'
      let dataRowsCopy = _.cloneDeep(data.row);
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
      this.data.searchResult = data.row;
      if (data.message.includes('MaxCountLimit')) {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Search Max Limit!', detail: "The search reached max limit, please change 'Search Text' to narrow results"
        // });
        this.toastr.info("The search reached max limit, please change 'Search Text' to narrow results", 'Search Max Limit!');
      }
      if (data.message.includes('DB buffer')) {
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Search Timeout!', detail: "There are more results available, Please refine your search query to return results."
        // });
        this.toastr.info('There are more results available, Please refine your search query to return results.', 'Search Timeout!');
      }
      if (!this.isLaunchSearch) {
        // this.documentService.savedSearch.searchResultsSaved = data;
        if (data.length < 1000000) {
          sessionStorage.setItem("searchResultsSaved", JSON.stringify(data));
        }
      }
      this.onSearchComplete.emit({ data: this.data.searchResult, dataCopy: dataRowsCopy, fullData: this.data });
      this.busySearchPagination = false;
    }, err => {
      this.busySearchPagination = false;
      let errortext = 'Error in search';
      let summaryText = 'Error';
      let severity = 'error';
      if (err.status == 500) {
        if (err.error.includes('FullTextRowLimit has been exceeded')) {
          summaryText = 'Text Search Limit exceeded!';
          errortext = "The search returned too many results, please change 'Search Text' to narrow results";
        } else if (err.error.includes('Query time limit exceeded')) {
          summaryText = 'Search Timeout!';
          errortext = "The search returned too many results, please change 'Search Text' to narrow results";
        }
        else if (err.error.includes('Please narrow the search')) {
          summaryText = 'Search Timeout!';
          errortext = "The search returned too many results, please change 'Search Text' to narrow results";
        }
        else {
          summaryText = 'No results fetched!';
          errortext = "Server communication failed";
          // err.error.slice(0, err.error.lastIndexOf(':') + 1);
          // errortext = err.error.slice(err.error.lastIndexOf(':') + 1);
        }
        summaryText = 'No results found!';
      }
      // this.growlService.showGrowl({
      //   severity: severity,
      //   summary: summaryText, detail: errortext
      // });
      this.toastr.info(errortext,summaryText);
    });
  }

  /*assignSortNotPaginationSimple() {
    this.searchDocument(false);
  }

  assignSortNotPaginationAdv() {
    this.searchDocument(false,'isbutton');
  }*/

  getSavedSearches(init) {
    if ((!this.router.url.toUpperCase().includes(('launch').toUpperCase())) || (this.usage && this.usage === 'popup')) {
      const tmpTreeData = [];
      this.busy = true;
      this.userService.getUserSearches().subscribe(settings => {
        this.busy = false;
        settings.map(s => {
          if (s.key === 'Saved Searches') {
            this.documentService.savedSearches = JSON.parse(s.val);
            if (this.selectedSearch) {
              this.documentService.savedSearches.map(search => {
                if (search.name === this.selectedSearch.name) {
                  this.selectedSearch = search;
                }
              })
            }
          }
        });
        if (!init && !this.selectedSearch && this.documentService.savedSearches.length > 0) {
          if (settings.length > 0) {
            this.selectedSearch = this.documentService.savedSearches[this.documentService.savedSearches.length - 1];
          }
        }
      }, err => {
        this.busy = false;
      });
    }
  }

  removeSearch(search) {
    this.confirmationService.confirm({
      header: 'Confirm Deletion?',
      message: 'Are you sure that you want to perform this action?',
      key: 'savedSearchRemoveConfirmation',
      acceptVisible: true,
      rejectVisible: true,
      accept: () => {
        this.confirmRemoveSearch(search);
      }
    });
  }

  confirmRemoveSearch(search) {
    this.documentService.savedSearches.map((s, i) => {
      if (s === search) {
        this.documentService.savedSearches.splice(i, 1);
      }
    });
    if (this.selectedSearch && this.selectedSearch === search) {
      this.selectedSearch = undefined;
      //this.data.model.selectedDocumentClass = this.data.documentClasses[0].value;
      this.resetToDefault();
      //this.getEntryTemplateForSearchId(this.data.documentClasses[0].value);
    }
    this.updateUserSearchesMethod(this.documentService.savedSearches, true);
  }


  resetToDefault() {
    this.saveSearchObj.name = '';
    this.createdByFieldSearch = false;
    this.data.isCurrent = true;
    this.data.maxRowLimit = 250;
    this.selectedSearch = undefined;
    this.data.model.selectedDocumentClass = this.data.documentClasses[0].value;
    if (!this.isLaunchSearch) {
      JSON.parse(sessionStorage.getItem("savedSearch")).advanceSearchSaved = [];
      // sessionStorage.savedSearch.advanceSearchSaved = [];
    }
    this.clearSearch();
    this.getEntryTemplateForSearchId(this.data.documentClasses[0].value);
  }

  selectSearch(search) {
    this.selectedSearch = search;
    let creatorField = _.find(this.selectedSearch.searchTemplate.props, function (p) {
      return p.symName === 'Creator';
    });
    if (creatorField && creatorField.mvalues[0] && (creatorField.mvalues[0].length > 0 || typeof creatorField.mvalues[0] === 'object')) {
      this.data.isCurrent = false;
      this.createdByFieldSearch = true;
    } else {
      this.data.isCurrent = true;
      this.createdByFieldSearch = false;
    }
    let actionType = this.data.model.actionType ? this.data.model.actionType : 'Default';
    this.data.model = {
      contentSearch: {
        oper: this.selectedSearch.model.contentSearch.oper,
        mvalues: Object.assign([], this.selectedSearch.model.contentSearch.mvalues)
      },
      actionType: actionType
    };
    this.data.model.selectedDocumentClass = this.selectedSearch.model.selectedDocumentClass;
    if (!this.selectedSearch.model.maxRowLimit || this.selectedSearch.model.maxRowLimit == "") {
      this.data.maxRowLimit = 250;
    }
    else {
      this.data.maxRowLimit = this.selectedSearch.model.maxRowLimit;
    }
    this.dynamicProps = [];
    this.getEntryTemplateForSearchId(this.data.model.selectedDocumentClass);
  }

  initSaveSearch() {
    // if (this.savedSearches && this.savedSearches.length === 3) {
    //   this.growlService.showGrowl({
    //     severity: 'error',
    //     summary: 'Fill Required', detail: 'A User Can Save Maximum Three Search'
    //   });
    //   return;
    // }
    this.searchAlreadyExists = false;
    if (this.selectedSearch) {
      this.saveSearchObj.name = this.selectedSearch.name;
      this.saveSearch();
    } else {
      this.showSaveSearchModal = true;
    }
  }

  saveSearch() {
    this.searchAlreadyExists = false;
    if (!this.selectedSearch) {
      this.documentService.savedSearches.map(search => {
        if (this.saveSearchObj.name === search.name) {
          this.searchAlreadyExists = true;
        }
      })
    }
    if (this.searchAlreadyExists) {
      return;
    }
    const searchObj = {
      name: this.saveSearchObj.name, model: {
        contentSearch: {
          oper: this.data.model.contentSearch.oper,
          mvalues: [this.data.model.contentSearch.mvalues[0]]
        },
        selectedDocumentClass: this.data.model.selectedDocumentClass,
        maxRowLimit: this.data.maxRowLimit
      }, searchTemplate: { props: [] }
    };
    this.data.searchTemplate.props.map((p, i) => {
      const index = this.dynamicProps.map(dProp => dProp.selectedOption.symName).indexOf(p.symName);

      if (index !== -1) {
        const tmp = {
          symName: this.dynamicProps[index].selectedOption.symName, mvalues: [], dtype:
            this.dynamicProps[index].selectedOption.dtype, oper: this.operFields[0].value
        };
        if (this.dynamicProps[index].mvalues[0]) {
          tmp.mvalues[0] = this.dynamicProps[index].mvalues[0];
        }
        if (this.dynamicProps[index].mvalues[1]) {
          tmp.mvalues[1] = this.dynamicProps[index].mvalues[1];
        }
        tmp.oper = this.dynamicProps[index].selectedOption.oper;//this.dynamicProps[index].oper;
        searchObj.searchTemplate.props.push(tmp);
      }
    });

    if (this.selectedSearch) {
      this.documentService.savedSearches.map((search, i) => {
        if (this.selectedSearch === search) {
          this.documentService.savedSearches[i] = searchObj;
        }
      });
      this.updateUserSearchesMethod(this.documentService.savedSearches, false);
    } else {
      const tmpSavedSearches = Object.assign([], this.documentService.savedSearches);
      tmpSavedSearches.push(searchObj);
      this.updateUserSearchesMethod(tmpSavedSearches, false);
    }
  }

  updateUserSearchesMethod(tmpSavedSearches, init) {
    let msg = "Search Saved Successfully";
    if (init) {
      msg = "Search Deleted Successfully";
    }
    this.busy = true;
    this.userService.getUserSearches().subscribe(settings => {
      this.busy = false;
      let exists = false;
      settings.map(s => {
        if (s.key === 'Saved Searches') {
          s.val = JSON.stringify(tmpSavedSearches);
          exists = true;
        }
      });
      if (!exists) {
        settings.push({
          appId: 'ECM',
          empNo: this.user.EmpNo,
          key: 'Saved Searches',
          val: JSON.stringify(tmpSavedSearches)
        })
      }
      this.busy = true;
      this.userService.updateUserSearches(settings).subscribe(res => {
        this.busy = false;
        this.documentService.savedSearches = tmpSavedSearches;
        // this.growlService.showGrowl({
        //   severity: 'info',
        //   summary: 'Success', detail: this.selectedSearch ? 'Search Updated Successfully' : msg
        // });
        this.toastr.info(this.selectedSearch ? 'Search Updated Successfully' : msg, 'Success');
        this.getSavedSearches(init);
        this.showSaveSearchModal = false;
      }, err => {
        this.busy = false;
        if ((err.error).includes('value too large for column')) {
          // this.growlService.showGrowl({
          //   severity: 'error',
          //   summary: 'Cant Save', detail: 'Maximum limit reached'
          // });
          this.toastr.error('Maximum limit reached', 'Cant Save');
        }
      });
    }, err => {
      this.busy = false;
    });
  }

  getUserSuggestion(event) {
    if (event.query.length >= 3) {
      let searchQueary = { userName: undefined };
      searchQueary.userName = event.query;
      this.busy = true;
      this.userService.searchEcmUsers(searchQueary).subscribe(res => {
        this.busy = false;
        let users = [];
        res.map((user) => {
          //users.push(user.userName);
          //users.push(user.login+' ('+user.name+')');
          users.push({ value: user.userName, label: user.fulName });
        });
        this.userSearchSuggestion = users;
      }, err => {
        this.busy = false;
      });
    }
  }

  usersSelected(event) {
    this.data.isCurrent = false;
    this.createdByFieldSearch = true;
  }

  clearSelection(event) {
    this.data.isCurrent = true;
    this.createdByFieldSearch = false;
  }

  getLookupValues(prop) {
    if (!(this.excepClassNames.indexOf(this.data.model.selectedDocumentClass.etName.toLowerCase()) > -1) && (prop.symName === 'DocumentFrom' || prop.symName === 'DocumentTo') && prop.hidden === 'false') {
      if (prop.lookups) {
        delete prop.lookups;
      }
    }
    if (!prop.hasOwnProperty('lookups')) {
      return undefined;
    } else {
      let lookupProp = _.cloneDeep(prop.lookups);
      lookupProp.unshift({
        id: -1,
        label: "",
        value: null,
        action: ""
      });
      return lookupProp;
    }
  }

  getOperators(prop) {
    if (prop.dtype.toLowerCase() === 'date') {
      return this.operDate;
    } else if (prop.dtype.toLowerCase() === 'integer') {
      return this.operInteger;
    } else if (prop.ltype == '2') {
      return this.operLookup;
    } else {
      return this.operFields;
    }
  }

  getDefaultOperatorValue(prop) {
    if (prop.dtype.toLowerCase() === 'date') {
      return this.operDate[0].value;
    } else if (prop.dtype.toLowerCase() === 'integer') {
      return this.operInteger[0].value;
    } else if (prop.ltype === 2) {
      return this.operLookup[0].value;
    } else if (prop.symName.toLowerCase() === 'documenttitle') {
      return this.operFields[1].value;
    } else {
      return this.operFields[0].value;
    }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  getEmptyRow(rowData: any, index: any) {
    return rowData.value === null ? 'h-xl' : '';
  }

  clearDocToFrom(dynamicProp) {
    event.stopPropagation();
    dynamicProp.mvalues[0] = '';
  }

  isNumber(event) {
    return (event.charCode == 8 || event.charCode == 0 || event.charCode == 13) ? null : event.charCode >= 48 && event.charCode <= 57
  }

  onFocusToDate(d) {
    const todatemin = new Date(d.mvalues[0]);
    d.minDate = todatemin;
  }

  validateStopWord(e:any, f) {
    this.msgs = [];
    let regex = /[\u0600-\u06FF\u0750-\u077F]/;
    let method = this.isNotSingleWord(e.target.value.trim());
    if (e.target.value.match(regex)) {
      method = this.isNotSingleWordArabic(e.target.value.trim());
    }
    if (e.target.value && e.target.value.trim().length >= 2 && !method) {
      if (e.target.value.trim().length === 2) {
        this.searchButtonDisabledStopWord = false;
        return;
      }
      this.adminService.validateStopWords(e.target.value.trim()).subscribe(d => {
        if (d === 'True') {
          this.searchButtonDisabledStopWord = true;
          this.msgs = [];
          if (this.isSimpleSearch && f === '1') {
            this.searchDocument(true);
          }
        }
        else {
          this.searchButtonDisabledStopWord = false;
          this.msgs = [];
          this.msgs.push({ severity: 'warn', summary: '', detail: this.stopwordmessageGlobal.message });
        }
      })
    }
    else if (e.target.value && e.target.value.trim().length <= 1) {
      this.searchButtonDisabledStopWord = false;
    }
    else {
      this.searchButtonDisabledStopWord = true;
      if (this.isSimpleSearch && f === '1') {
        this.searchDocument(true);
      }
    }
    return this.searchButtonDisabledStopWord;
  }

  isNotSingleWord(s):any {
    if (s.trim().split(/\W+/).length > 1) {
      return true;
    }
  }

  isNotSingleWordArabic(s):any {
    if (s.trim().split(/\s+/).length > 1) {
      return true;
    }
  }


  assignDependentLookup(detail) {
    //debugger;
    
    if (this.et_dependent_lookup && this.et_dependent_lookup.indexOf(',') != -1) {
      let etdls = this.et_dependent_lookup.split(',');
      for (let i = 0; i < etdls.length; i++) {
        let et_dep_lkup = etdls[i];
        
        if (et_dep_lkup && et_dep_lkup.indexOf(':') != -1) {
          let etdeplkupVals= et_dep_lkup.split(':');

          if ((etdeplkupVals[0] != "" && this.data.searchTemplate.name.trim().toUpperCase() === etdeplkupVals[0].trim().toUpperCase()) 
                && (etdeplkupVals[1] != "" && detail.symName.trim().toUpperCase() === etdeplkupVals[1].trim().toUpperCase())) {
            
            let mainListVal = null;
            const index = this.dynamicProps.map(dProp => dProp.selectedOption.symName).indexOf(etdeplkupVals[2]);
            //console.log("index "+index+" prop "+p.symName);
            if (index !== -1) {
              mainListVal = this.dynamicProps[index].mvalues[0];
            }

            if(mainListVal && mainListVal !== null){
              this.busy = true;
              this.adminService.getLookupDependentValues(0, mainListVal).subscribe(val => {
                this.busy = false;
                val.map(d => {
                  d.label = d.label.replace("''", "'");
                  d.value = d.value.replace("''", "'");
                });
                detail.lookups = val;
              }, err => {
                this.busy = false;
              });
            }
            else{
              //this.busy = true;
              if(detail.lkpId && detail.lkpId > 0){
                this.busy = true;
                this.adminService.getLookupValues(detail.lkpId).subscribe(val => {
                  this.busy = false;
                  val.map(d => {
                    d.label = d.label.replace("''", "'");
                    d.value = d.value.replace("''", "'");
                  });
                  detail.lookups = val;
                }, err => {
                  this.busy = false;
                });
              }
            }
          }
        } 
      }
    } else if (this.et_dependent_lookup && this.et_dependent_lookup.trim().length > 0) {
      let et_dependent = this.et_dependent_lookup;

      if (et_dependent && et_dependent.indexOf(':') != -1) {
        let etdeplkupVals= et_dependent.split(':');
        //this.data.model.selectedDocumentClass.etName
        if ((etdeplkupVals[0] != "" && this.data.searchTemplate.name.trim().toUpperCase() === etdeplkupVals[0].trim().toUpperCase()) 
                && (etdeplkupVals[1] != "" && detail.symName.trim().toUpperCase() === etdeplkupVals[1].trim().toUpperCase())) {
            let mainListVal = null;
            const index = this.dynamicProps.map(dProp => dProp.selectedOption.symName).indexOf(etdeplkupVals[2]);
            //console.log("index "+index+" prop "+p.symName);
            if (index !== -1) {
              mainListVal = this.dynamicProps[index].mvalues[0];
            }

            if(mainListVal && mainListVal !== null){
              this.busy = true;
              this.adminService.getLookupDependentValues(0, mainListVal).subscribe(val => {
                this.busy = false;
                val.map(d => {
                  d.label = d.label.replace("''", "'");
                  d.value = d.value.replace("''", "'");
                });
                detail.lookups = val;
              }, err => {
                this.busy = false;
              });
            }
            else{
              
              if(detail.lkpId && detail.lkpId > 0){
                this.busy = true;
                this.adminService.getLookupValues(detail.lkpId).subscribe(val => {
                  this.busy = false;
                  val.map(d => {
                    d.label = d.label.replace("''", "'");
                    d.value = d.value.replace("''", "'");
                  });
                  detail.lookups = val;
                }, err => {
                  this.busy = false;
                });
              }
            }
          }
      } 
    }
  }

  onClickLookup(d) {
    //debugger;
    //alert("New change");
    let testval = this.data.model.selectedDocumentClass.etName;
    if (this.et_dependent_lookup.trim().toUpperCase().indexOf(this.data.searchTemplate.name.trim().toUpperCase()) != -1)
        this.assignDependentLookup(d);
    
    /* let exist = false;
    let obj = { id: -1, label: "", value: null, action: "" };
    d.lookups.map(d => {
      if (d.value === null) {
        exist = true;
      }
    });
    if (!exist) {
      d.lookups.unshift(obj);
    } */

    
  }

  ngOnDestroy() {
    this.clearSubscriptions();
    if (!this.isLaunchSearch && !this.selectedSearch) {
      sessionStorage.setItem("savedSearch", JSON.stringify({
        advanceSearchSaved: this.dynamicProps,
        documentClassSaved: this.data.model.selectedDocumentClass, selectedSavedSearchObj: this.selectedSearch, isCurrentVersion: this.data.isCurrent,
        maxResult: this.data.maxRowLimit, simpleSearchText: this.data.model.contentSearch.mvalues[0], searchCriteria: this.data.model.contentSearch.oper,
        et: this.data.documentClasses, ets: this.data.searchTemplate
      }))
      //  this.documentService.savedSearch.advanceSearchSaved = this.dynamicProps;
      //  this.documentService.savedSearch.documentClassSaved = this.data.model.selectedDocumentClass;
      //  this.documentService.savedSearch.selectedSavedSearchObj = this.selectedSearch;
      //  this.documentService.savedSearch.isCurrentVersion = this.data.isCurrent;
      //  this.documentService.savedSearch.maxResult = this.data.maxRowLimit;
      //  this.documentService.savedSearch.simpleSearchText = this.data.model.contentSearch.mvalues[0];
      // this.documentService.savedSearch.searchCriteria = this.data.model.contentSearch.oper;
    }
    // sessionStorage.getItem("savedSearch").et=this.data.documentClasses;
    // sessionStorage.getItem("savedSearch").ets = this.data.searchTemplate;
    //this.documentService.setLastSearchToLocalStorage();
    this.isClassChange = false;
    this.createdByFieldSearch = false;
  }
}