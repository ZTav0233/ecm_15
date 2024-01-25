import { Component, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { BreadcrumbService } from "../../services/breadcrumb.service";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user/user.model";
import { CoreService } from "../../services/core.service";
import { Subscription } from 'rxjs';
import { ReportService } from "../../services/report.service";
import { MenuItem} from "primeng/api";
import { saveAs } from 'file-saver';
import { AdminService } from "../../services/admin.service";
import * as _ from "lodash";
import { GrowlService } from "../../services/growl.service";
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';
import { Table } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
@Component({
  styleUrls: ['./report-component.css'],
  selector: 'app-report-component',
  templateUrl: './report.component.html'
})

export class ReportComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dataTable!: Table;
  public activeIndex: any[] = [0];
  reportDataTab=false;
  reportChartTab=false;
  public report: any = {
    roles: {},
    search: {},
    options: {
      reportType: [],
      category: {},
      dailyChecked: false,
      searchType: [],
      dirList: [],
      groupList: [],
      teamList: [],
      roleList: [],
      allTotal: {
        receivedCount: 0,
        sentCount: 0,
        docCount: 0,
        eSignCount: 0
      },
      chartTotal: 0,
      chartPages: {},
      chartPageCount: 0,
      previousSearchedReportType: '',
      previousSearchedCategory: '',
      selectedNode: undefined
    },
    supervisorTreeLastNode: undefined
  };
  public user = new User();
  subscriptions: Subscription[] = [];
  roleTreeExpandedIcon = 'fa fa-fw ui-icon-people-outline';
  roleTreeCollapsedIcon = 'fa fa-fw ui-icon-people';
  private tmpRoleTree = [];
  public reportCount: any[] = [];
  public chartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: true,
     
    barThickness:10,
    indexAxis: 'y',
    plugins: {
      datalabels: {
        align: 'end',
        anchor: 'end',
        backgroundColor: null,
        borderColor: null,
        borderRadius: 2,
        borderWidth: 1,
        color: '#000000',
        font: {
          size: 10,
          weight: 'bold'
        },
        offset: 4,
        padding: -5,
        formatter: function (value) {
          return value
        }
      }
    },
    scales: {
      xAxes: [
        {
          ticks: {
            fontSize: 12,
            fontColor: '#000000',
            fontFamily: 'sans-serif',
            min: 0, // it is for ignoring negative step.
            maxTicksLimit: 12,
            beginAtZero: true,
            callback: function (value, index, values) {
              if (Math.floor(value) === value) {
                return value;
              }
            }
          },
          gridLines: {
            drawBorder: true,
            display: false,
            //drawOnChartArea: false
          }
        }
      ],
      yAxes: [
        {
          barPercentage: 0.1,
          categoryPercentage: 1.0,
          maxBarThickness: 15,
          barThickness:10,
          ticks: {
            fontSize: 12,
            fontColor: '#000000',
            fontFamily: 'sans-serif'
          },
          gridLines: {
            drawBorder: true,
            display: false,
            //drawOnChartArea: false
          },
        }
      ]
    },
    title: {
      display: false,
      text: 'Chart',
      fontSize: 18,
      fontColor: '#000000',
      fontStyle: 'bold',
      fontFamily: 'sans-serif'
    },
    legend: {
      labels: {
        fontSize: 12,
        fontColor: '#000000',
        fontFamily: 'sans-serif'
      },
      onClick: function(e, legendItem) {
           e.stopPropagation();
        }
    },layout:{
      padding:{
        right:25
      }
    }
  };
  public allChartOptions: any = {
     
    barThickness:10,
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      datalabels: {
        align: 'end',
        anchor: 'end',
        backgroundColor: null,
        borderColor: null,
        borderRadius: 2,
        borderWidth: 1,
        color: '#000000',
        font: {
          size: 10,
          weight: 'bold'
        },
        offset: 4,
        padding: -5,
        formatter: function (value) {
          return value
        }
      }
    },
    scales: {
      xAxes: [
        {
          ticks: {
            fontSize: 12,
            fontColor: '#000000',
            fontFamily: 'sans-serif',
            min: 0, // it is for ignoring negative step.
            maxTicksLimit: 12,
            beginAtZero: true,
            callback: function (value, index, values) {
              if (Math.floor(value) === value) {
                return value;
              }
            }
          },
          gridLines: {
            drawBorder: true,
            display: false,
            //drawOnChartArea: false
          }
        }
      ],
      yAxes: [
        {
          barPercentage: 0.8,
          categoryPercentage: 1.0,
          maxBarThickness: 45,
          barThickness: 12,
          ticks: {
            fontSize: 12,
            fontColor: '#000000',
            fontFamily: 'sans-serif'
          },
          gridLines: {
            drawBorder: true,
            display: false,
            //drawOnChartArea: false
          },
        }
      ]
    },
    title: {
      display: false,
      text: 'Chart',
      fontSize: 18,
      fontColor: '#000000',
      fontStyle: 'bold',
      fontFamily: 'sans-serif'
    },
    legend: {
      labels: {
        fontSize: 12,
        fontColor: '#000000',
        fontFamily: 'sans-serif'
      },
      onClick: function(e, legendItem) {
           e.stopPropagation();
        }
    },layout:{
      padding:{
        right:25
      }
    },
  };
  public otherChartOptions: any = {
     
    barThickness:10,
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      datalabels: {
        align: 'end',
        anchor: 'end',
        backgroundColor: null,
        borderColor: null,
        borderRadius: 2,
        borderWidth: 1,
        color: '#000000',
        font: {
          size: 10,
          weight: 'bold'
        },
        offset: 4,
        padding: -5,
        formatter: function (value) {
          return value
        }
      }
    },
    scales: {
      xAxes: [
        {
          ticks: {
            fontSize: 12,
            fontColor: '#000000',
            fontFamily: 'sans-serif',
            min: 0, // it is for ignoring negative step.
            maxTicksLimit: 12,
            beginAtZero: true,
            callback: function (value, index, values) {
              if (Math.floor(value) === value) {
                return value;
              }
            }
          },
          gridLines: {
            drawBorder: true,
            display: false,
            //drawOnChartArea: false
          }
        }
      ],
      yAxes: [
        {
          barPercentage: 0.8,
          categoryPercentage: 1.0,
          maxBarThickness: 45,
          ticks: {
            fontSize: 12,
            fontColor: '#000000',
            fontFamily: 'sans-serif'
          },
          gridLines: {
            drawBorder: true,
            display: false,
            //drawOnChartArea: false
          },
        }
      ]
    },
    title: {
      display: false,
      text: 'Chart',
      fontSize: 18,
      fontColor: '#000000',
      fontStyle: 'bold',
      fontFamily: 'sans-serif'
    },
    legend: {
      labels: {
        fontSize: 12,
        fontColor: '#000000',
        fontFamily: 'sans-serif'
      },
      onClick: function(e, legendItem) {
           e.stopPropagation();
        }
    },layout:{
      padding:{
        right:25
      }
    },
  };
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  public chartType = 'horizontalBar';
  public chartLegend = false;
  public reportChartData = false;
  public eSignData = false;
  public memoData = false;
  public allData = false;
  public exportBtnItems: MenuItem[] = [];
  public searchQuery: any = {};
  public today = new Date();
  public eSignDocData: any[] = [];
  public memoDocData: any[] = [];
  public colHeaders: any[] = [];
  public colHeadersESign: any[] = [];
  public colHeadersMemo: any[] = [];
  public allReportColHeaders: any[] = [];
  public pageSize: any = 10;
  public currentPage = 0;
  public expandedRowsGroups: string[] = [];
  busy: boolean;
  maxToDateValue:any;
  fromDateMin:any;
  constructor(
    private toastr:ToastrService,
    private breadcrumbService: BreadcrumbService,
    private us: UserService,
    private coreService: CoreService,
    private rs: ReportService,
    private as: AdminService,
    private growlService: GrowlService) 
    {
  }

  ngOnInit() {

    this.maxToDateValue=new Date();
    this.us.getUserSettings().subscribe(val => {
      const res: any = val;
      this.assignPagination(res);
    });
    this.report.options.searchType = [{ label: 'User Name', value: 'userName' }, { label: 'KOC ID', value: 'empNo' }];
    this.report.options.reportType = [{ label: 'Workflow', value: 'workflow' }, { label: 'Documents', value: 'doc' },
    { label: 'eSign Documents', value: 'eSignDoc' },{ label: 'Memo', value: 'memo' }, { label: 'All', value: 'all' }];
    this.report.options.category = {
      workflow: [{ label: 'Received', value: 'received' }, { label: 'Sent', value: 'sent' }],
      doc: [{ label: 'Created', value: 'created' }], eSignDoc: [], all: [], memo:[{ label: 'All', value: 'All' }]
    };

    this.colHeadersESign = [
      { field: 'empName', header: 'User Display Name' },
      { field: 'empTitle', header: 'Designation', hidden: true },
      { field: 'empNo', header: 'KOC ID' },
      { field: 'orgCode', header: 'Organization Code' },
      { field: 'reqDate', header: 'Request Date', sortField: 'reqDate2' },
      { field: 'signDate', header: 'Signed Date', sortField: 'signDate2' }
      //{field: 'status', header: 'Status'},
      //{field: 'type', header: 'Type'},
      //{field: 'orgName', header: 'Organization Name'}
    ];

    this.colHeadersMemo = [
      { field: 'memoEmpName', header: 'User Display Name' },
      { field: 'reqDate', header: 'Request Date', sortField: 'reqDate2' },
      { field: 'memoLang', header: 'Memo Lang', hidden: true },
      { field: 'memoType', header: 'Memo Type' },
      { field: 'memoDate', header: 'Memo Date', sortField: 'memoDate2' },
      { field: 'signUser', header: 'From User' },
      { field: 'orgCode', header: 'Org Code' },
      { field: 'status', header: 'Status' }
    ];

    this.colHeaders = [
      { field: 'orgTeamName', header: 'Team Name' },
      { field: 'orgCode', header: 'Organization Code' },
      //{field: 'count', header: 'Count'}
    ];
    this.allReportColHeaders = [
      { field: 'orgTeamName', header: 'Team Name' },
      { field: 'inboxCount', header: 'Received' },
      { field: 'sentCount', header: 'sent' },
      { field: 'docCount', header: 'Created' },
      { field: 'eSignCount', header: 'eSign' }
    ];
    
    this.breadcrumbService.setItems([
      { label: 'Reports' }
    ]);
    this.user = this.us.getCurrentUser();
    const subscription = this.us.logIn(this.user.userName, 'def').subscribe(data => {
      localStorage.removeItem('user');
      localStorage.setItem('user', JSON.stringify(data));
      this.user = this.us.getCurrentUser();
    });
    if (this.user.isReportAdmin === 'Y') {
      this.report.options.category.eSignDoc = [{ label: 'Signed', value: 'SIGNED' }, { label: 'All', value: 'ALL' }];
      this.gerTopOrgTree();
    } else {
      this.report.options.category.eSignDoc = [{ label: 'Signed', value: 'SIGNED' }];
      this.gerSupervisorTree();
      this.getRoleList(this.user.orgCode);
    }
    this.exportBtnItems.push({
      'label': 'PDF', command: event => {
        this.exportToPdf();
      }
    }, {
      'label': 'Excel', command: event => {
        this.exportToExcel();
      }
    });
     // this.report.search.toDate=new Date();
     // this.report.search.fromDate=new Date(new Date().setFullYear(new Date().getFullYear() - 4));
    this.fromDateMin=new Date(new Date().setFullYear(new Date().getFullYear() - 4))
  }

  getRoleList(orgCode, cb?) {
    this.report.options.roleList = [];
    this.report.search.roleSearchText=undefined;
    this.busy = true;
    this.us.getRoleByOrgCode(orgCode).subscribe(res => {
      this.busy = false;
      res.map((role) => {
        this.report.options.roleList.push({
          label: role.name.length>=55? role.name.substring(0,55)+'...': role.name,
          value: { id: role.id, orgCode: role.orgCode, parent: role.parent, type: role.type, desc: role.name }
        })
      });
      if (cb)
        cb();
    }, err => {
      this.busy = false;
    });
  }

  assignPagination(val) {
    if (val !== undefined) {
      val.map((d, i) => {
        if (d.key === 'Page Size') {
          if (d.val) {
            this.pageSize = parseInt(d.val, 10);
          } else {
            this.pageSize = 10;
          }
        }
      });
    }
  }

  gerTopOrgTree() {
    this.busy = true;
    this.as.getSubLevelOrgUnits(1).subscribe(res => {//1 in KOC env and 3 in dev env
      this.busy = false;
      const tmpRoles = [];
      this.report.options.dirList = [];
      res.map((head) => {
        tmpRoles.push({
          label: head.desc,
          data: head,
          expandedIcon: this.roleTreeExpandedIcon,
          collapsedIcon: this.roleTreeCollapsedIcon,
          leaf: false,
          expanded: false,
          selectable: true
        });
        this.report.options.dirList.push({
          label: head.desc.length>=55? head.desc.substring(0,55)+'...': head.desc,
          value: { id: head.id, orgCode: head.orgCode, parent: head.parent, type: head.type,desc:head.desc }
        })
      });
      this.report.roles.roleTree = tmpRoles;
    }, err => {
      this.busy = false;
    });
  }

  gerSupervisorTree() {
    this.tmpRoleTree = [];
    this.report.roles.roleTree = [];
    this.busy = true;
    this.us.getUserSupervisorTree(this.user.EmpNo).subscribe(res => {
      this.busy = false;
      res.map((head) => {
        if (head.parent === 1) { //1 in KOC env and 3 in dev env
          this.tmpRoleTree.push({
            label: head.headRoleName,
            data: head,
            expandedIcon: this.roleTreeExpandedIcon,
            collapsedIcon: this.roleTreeCollapsedIcon,
            leaf: false,
            expanded: !(this.user.orgCode === head.orgCode),
            selectable: this.user.orgCode === head.orgCode
          });
        }
      });
      if (res.length > 1) {
        this.setChildren(this.tmpRoleTree[0], res, 1);
      } else {
        this.setOrgHierarchyFromSupervisorTree(this.tmpRoleTree[0]);
        this.report.options.selectedNode = this.tmpRoleTree[0];
        this.report.options.supervisorTreeLastNode = this.tmpRoleTree[0];
        if (this.tmpRoleTree[0].data.type.toLowerCase() === 'dir' || this.tmpRoleTree[0].data.type.toLowerCase() === 'directorate'
          || this.tmpRoleTree[0].data.type.toLowerCase() === 'group') {
          this.getSubOrgUnitForHierarchy(this.tmpRoleTree[0].data.id, this.getHierarchyByType(this.tmpRoleTree[0].data.type));
        }
        this.report.roles.roleTree = this.tmpRoleTree;
      }
    }, err => {
      this.busy = false;
    });
  }

  setChildren(parent, children, index) {
    let newParent;
    if (!parent.children) {
      parent.children = [];
      parent.children.push({
        label: children[index].headRoleName,
        data: children[index],
        expandedIcon: this.roleTreeExpandedIcon,
        collapsedIcon: this.roleTreeCollapsedIcon,
        leaf: false,
        expanded: true,
        selectable: this.user.orgCode === children[index].orgCode || parent.selectable
      });
      newParent = parent.children[0];
      this.setOrgHierarchyFromSupervisorTree(parent);
    } else {
      parent.children.map(c => {
        if (c.data.id === children[index].id) {
          c.expanded = true;
          newParent = c;
        }
      });
    }
    if (index < children.length - 1) {
      this.setChildren(newParent, children, index + 1);
    } else {
      if (index === children.length - 1) {
        newParent.expanded = false;
        this.report.options.selectedNode = newParent;
        this.report.options.supervisorTreeLastNode = newParent;
        this.setOrgHierarchyFromSupervisorTree(newParent);
        this.getSubOrgUnitForHierarchy(newParent.data.id, this.getHierarchyByType(newParent.data.type));
      }
      this.report.roles.roleTree = this.tmpRoleTree;
    }
  }

  private getHierarchyByType(type) {
    if (type === "DIR" || type.toLowerCase() === "directorate") {
      return 'groupList';
    } else if (type.toLowerCase() === "group") {
      return 'teamList';
    } else {
      return 'roleList';
    }
  }

  setOrgHierarchyFromSupervisorTree(node) {
    if (node.data && (node.data.type === 'DIR' || node.data.type.toLowerCase() === 'directorate')) {
      this.report.options.dirList = [{
        label: node.data.headRoleName.length>=55?node.data.headRoleName.substring(0,55)+'...': node.data.headRoleName,
        value: { id: node.data.id, orgCode: node.data.orgCode, parent: node.data.parent, type: node.data.type,desc:node.data.desc }
      }];
      this.report.search.dirSelected = { id: node.data.id, orgCode: node.data.orgCode, parent: node.data.parent, type: node.data.type,desc: node.data.desc.length>=55?node.data.desc.substring(0,55)+'...': node.data.desc };
    } else if (node.data.type.toLowerCase() === 'group') {
      this.report.options.groupList = [{
        label:  node.data.headRoleName.length>=55? node.data.headRoleName.substring(0,55)+'...': node.data.headRoleName,
        value: { id: node.data.id, orgCode: node.data.orgCode, parent: node.data.parent, type: node.data.type ,desc:node.data.desc}
      }];
      this.report.search.groupSelected = { id: node.data.id, orgCode: node.data.orgCode, parent: node.data.parent, type: node.data.type,desc: node.data.desc.length>=55?node.data.desc.substring(0,55)+'...': node.data.desc };
    } else if (node.data.type.toLowerCase() === 'team') {
      this.report.options.teamList = [{
        label: node.data.headRoleName.length>=55? node.data.headRoleName.substring(0,55)+'...': node.data.headRoleName,
        value: { id: node.data.id, orgCode: node.data.orgCode, parent: node.data.parent, type: node.data.type,desc:node.data.desc }
      }];
      this.report.search.teamSelected = { id: node.data.id, orgCode: node.data.orgCode, parent: node.data.parent, type: node.data.type,desc: node.data.desc.length>=55?node.data.desc.substring(0,55)+'...': node.data.desc };
    }
  }

  onNodeExpanded(event) {
    if (event.node.selectable) {
      this.getSubOrgUnits(event.node, () => {
        this.user.isReportAdmin === 'N' ? this.getRoleList(this.user.orgCode) : this.getRoleList(event.node.data.orgCode);
        this.selectRoleFromTree(event.node);
        this.report.options.selectedNode = event.node;
        this.report.search.userSearchText = undefined;
        this.report.search.searchType = undefined;
      });
    }
  }

  getSubOrgUnits(parent, cb?) {
    let level = 'dirList';
    if (parent.data.type === "DIR" || parent.data.type.toLowerCase() === "directorate") {
      level = 'groupList';
      this.report.search.groupSelected = undefined;
      this.report.search.teamSelected = undefined;
      this.report.options.groupList = [];
      this.report.options.teamList = [];
    } else if (parent.data.type.toLowerCase() === "group") {
      level = 'teamList';
      this.report.search.teamSelected = undefined;
      this.report.options.teamList = [];
    } else if (parent.data.type.toLowerCase() === "team") {
      level = 'roleList';
      this.report.search.roleSearchText = undefined;
      this.report.options.roleList = [];
    }
    if (parent.data.type.toLowerCase() === "team") {
      this.getRoleList(parent.data.orgCode, () => cb());
    } else {
      this.busy = true;
      this.as.getSubLevelOrgUnits(parent.data.id).subscribe((res: any) => {
        this.busy = false;
        parent.children = [];
        res.map((d) => {
          parent.children.push({
            label: d.desc,
            data: d,
            expandedIcon: this.roleTreeExpandedIcon,
            collapsedIcon: this.roleTreeCollapsedIcon,
            leaf: d.type.toLowerCase() === "team",
            selectable: true
          });
          this.report.options[level].push({ label: d.desc.length>=55? d.desc.substring(0,55)+'...':  d.desc, value: { id: d.id, orgCode: d.orgCode, parent: d.parent, type: d.type, desc: d.desc } });
        }
        );
        if (cb)
          cb();
      }, err => {
        this.busy = false;
      });
    }
  }

  roleSelected(event) {
    this.searchQuery.userType = ' ';
    this.report.search.orgCode = event.node.data.orgCode;
    this.report.search.orgUnitSelected = undefined;
    this.report.search.orgUnitSearchText = undefined;
    this.report.search.userSearchText = undefined;
    this.report.search.searchType = undefined;
    this.clearRoleSelection();
    this.getSubOrgUnits(event.node, () => {
      this.selectRoleFromTree(event.node);
      this.getRoleList(event.node.data.orgCode);
      //this.user.isReportAdmin === 'N' ? this.getRoleList(this.user.orgCode) : this.getRoleList(event.node.data.orgCode);
    });
  }

  selectRoleFromTree(node) {
    if (node.data.type === "DIR" || node.data.type.toLowerCase() === "directorate") {
      this.report.search.dirSelected = {
        id: node.data.id,
        orgCode: node.data.orgCode,
        parent: node.data.parent,
        type: node.data.type,
        desc: node.data.desc
      };
    } else if (node.data.type.toLowerCase() === "group") {
      if (node.parent.data.id !== this.report.search.dirSelected.id) {
        this.getSubOrgUnitForHierarchy(node.parent.data.parent, 'dirList', () => {
          this.report.search.dirSelected = {
            id: node.parent.data.id,
            orgCode: node.parent.data.orgCode,
            parent: node.parent.data.parent,
            type: node.parent.data.type,
            desc:  node.parent.data.desc
          };
        });
        this.getSubOrgUnitForHierarchy(node.data.parent, 'groupList', () => {
          this.report.search.groupSelected = {
            id: node.data.id,
            orgCode: node.data.orgCode,
            parent: node.data.parent,
            type: node.data.type,
            desc: node.data.desc
          };
        });
      } else {
        this.report.search.groupSelected = {
          id: node.data.id,
          orgCode: node.data.orgCode,
          parent: node.data.parent,
          type: node.data.type,
          desc: node.data.desc
        };
      }
    } else if (node.data.type.toLowerCase() === "team") {
      if (node.parent.data.id !== this.report.search.groupSelected.id) {
        this.getSubOrgUnitForHierarchy(node.parent.parent.data.parent, 'dirList', () => {
          this.report.search.dirSelected = {
            id: node.parent.parent.data.id,
            orgCode: node.parent.parent.data.orgCode,
            parent: node.parent.parent.data.parent,
            type: node.parent.parent.data.type,
            desc: node.parent.parent.data.desc
          };
        });
        this.getSubOrgUnitForHierarchy(node.parent.data.parent, 'groupList', () => {
          this.report.search.groupSelected = {
            id: node.parent.data.id,
            orgCode: node.parent.data.orgCode,
            parent: node.parent.data.parent,
            type: node.parent.data.type,
            desc:  node.parent.data.desc
          };
        });
        this.getSubOrgUnitForHierarchy(node.data.parent, 'teamList', () => {
          this.report.search.teamSelected = {
            id: node.data.id,
            orgCode: node.data.orgCode,
            parent: node.data.parent,
            type: node.data.type,
            desc: node.data.desc
          };
        });
      } else {
        this.report.search.teamSelected = {
          id: node.data.id,
          orgCode: node.data.orgCode,
          parent: node.data.parent,
          type: node.data.type,
          desc: node.data.desc
        };
      }
    }
   // this.getRoleList(node.data.orgCode);
  }

  getSubOrgUnitForHierarchy(parentOrgId, hierarchy, cb?) {
    this.report.options[hierarchy] = [];
    this.busy = true;
    this.as.getSubLevelOrgUnits(parentOrgId).subscribe((res: any) => {
      this.busy = false;
      res.map((d) => {
        this.report.options[hierarchy].push({ label: d.desc.length>=55? d.desc.substring(0,55)+'...':  d.desc, value: { id: d.id, orgCode: d.orgCode, parent: d.parent, type: d.type, desc: d.desc } });
      });
      if (cb)
        cb();
    }, err => {
      this.busy = false;
    });
  }

  getRoleMembers(role) {
    if (!role.members) {
      let RoleNameString = '';
      let roleId;
      if (role.headRoleId) {
        roleId = role.headRoleId
      } else if (role.id) {
        roleId = role.id
      }
      this.busy = true;
      this.us.getRoleMembers(roleId).subscribe((res: any) => {
        this.busy = false;
        for (const RName of res) {
          if (RName.name !== undefined) {
            RoleNameString = RoleNameString + '\n' + '<i class=material-icons style=font-size:.95em;>person</i>' + ' ' + RName.name;
          }
        }
        role.members = RoleNameString.slice(1);
      }, err => {
        this.busy = false;
      });
    }
  }

  resetFromDatePicker(event) {
    this.report.search.fromDate = undefined;
  }

  resetToDatePicker(event) {
    this.report.search.toDate = undefined;
  }

  fromDateSelected(event) {
    this.report.search.minDate = new Date(event);
    const d = new Date(event);
    const temp = new Date(event);
    d.setDate(d.getDate());
    this.maxToDateValue=new Date(d.setFullYear(d.getFullYear() + 4));
    this.report.search.toDate=new Date(temp.setFullYear(temp.getFullYear() + 4));
    const todatemin = new Date(event);
    this.report.search.minDate  = todatemin;
    if(moment((this.maxToDateValue), "DD/MM/YYYY").toDate() > moment((this.today), "DD/MM/YYYY").toDate()){
       this.maxToDateValue=this.today;
       this.report.search.toDate=moment((this.today), "DD/MM/YYYY").toDate();
    }
  }

  clearOrgSelection() {
    this.report.search.orgCode = undefined;
    this.refreshTree();
  }

  clearRoleSelection() {
    //added on 18032019
    //this.report.options.groupList = [];
    if (this.user.isReportAdmin === 'Y') {
      //this.report.options.roleList = [];
    }
    //this.report.search.dirSelected=undefined;
    //this.report.search.groupSelected=undefined;
    //end
    this.report.search.roleSearchText = undefined;
    this.searchQuery.userType = undefined;
    this.searchQuery.EmpNo = undefined;
    this.searchQuery.orgCode = undefined;
    this.searchQuery.type = undefined;
  }

  clearUserSelection() {
    this.report.search.userSearchText = undefined;
    this.searchQuery.userType = undefined;
    this.searchQuery.EmpNo = undefined;
    this.searchQuery.orgCode = undefined;
    this.searchQuery.type = undefined;
    this.enterUserName();
  }
  applyFilterGlobal($event, stringVal) {
    this.dataTable.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }
  getReport() {
    if (typeof this.report.search.userSearchText === 'string') {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure', detail: 'Please Select Valid User'
      // });
      this.toastr.info('Please Select Valid User', 'Failure');
      return;
    }
    if (this.report.search.userSearchText && !(this.report.search.searchSuggestions && this.report.search.searchSuggestions.length > 0)) {
      // this.growlService.showGrowl({
      //   severity: 'error',
      //   summary: 'Failure', detail: 'Please Select Valid User'
      // });
      this.toastr.error('Please Select Valid User', 'Failure');
      return;
    }
    if (!this.report.search.roleSearchText && !this.report.search.userSearchText &&
      (this.report.search.dirSelected || this.report.search.groupSelected || this.report.search.teamSelected)) {
      delete this.searchQuery.EmpNo;
      delete this.searchQuery.id;
      delete this.searchQuery.userType;
      if (this.report.search.dirSelected) {
        this.searchQuery.orgCode = this.report.search.dirSelected.orgCode;
        this.searchQuery.type = this.report.search.dirSelected.type;
      } if (this.report.search.groupSelected) {
        this.searchQuery.orgCode = this.report.search.groupSelected.orgCode;
        this.searchQuery.type = this.report.search.groupSelected.type;
      } if (this.report.search.teamSelected) {
        this.searchQuery.orgCode = this.report.search.teamSelected.orgCode;
        this.searchQuery.type = this.report.search.teamSelected.type;
      }
      this.colHeaders = [{ field: 'orgTeamName', header: this.getLabelByOrg() },
      { field: 'orgCode', header: 'Organization Code' },
      ];
      this.allReportColHeaders = [
        { field: 'orgTeamName', header: this.getLabelByOrg() },
        { field: 'inboxCount', header: 'Received' },
        { field: 'sentCount', header: 'sent' },
        { field: 'docCount', header: 'Created' },
        { field: 'eSignCount', header: 'eSign' }
      ];
    } else {
      this.colHeaders = [
        { field: 'orgRoleName', header: this.getRoleHeader() },
        { field: 'orgTeamName', header: 'Team Name' },
        { field: 'orgGroupName', header: 'Directorate/Group Name' },
        { field: 'orgCode', header: 'Organization Code' },
      ];
      this.allReportColHeaders = [
        { field: 'orgTeamName', header: 'Team Name' },
        { field: 'inboxCount', header: 'Received' },
        { field: 'sentCount', header: 'sent' },
        { field: 'docCount', header: 'Created' },
        { field: 'eSignCount', header: 'eSign' }
      ];
      this.searchQuery.type = "User";
    }
    if (this.report.search.excludeOperators) {
      this.searchQuery.exOperator = 'Y';
    } else {
      delete this.searchQuery.exOperator;
    }
    this.searchQuery.fromDate = this.coreService.getFormattedDateString(this.report.search.fromDate, this.coreService.dateTimeFormats.DDMMYYYY, '/');
    if (this.report.search.toDate) {
      this.searchQuery.toDate = this.coreService.getFormattedDateString(this.report.search.toDate, this.coreService.dateTimeFormats.DDMMYYYY, '/');
    } else {
      const today = new Date();
      this.searchQuery.toDate = this.coreService.getFormattedDateString(today, this.coreService.dateTimeFormats.DDMMYYYY, '/');
    }
    // let subscription;
    this.reportChartData = false;
    this.eSignData = false;
    this.allData = false;
    this.memoData = false;
    this.searchQuery.exportData = undefined;
    this.searchQuery.eSignData = undefined;
    this.searchQuery.memoData = undefined;
    this.searchQuery.exportAllData = undefined;
    if (this.report.search.reportType === 'workflow' && this.report.search.category === 'received') {
      this.chartOptions = this.otherChartOptions;
      this.chartOptions.title.text = "Received Workflow Chart";
      this.busy = true;
      this.rs.getOrgWorkitemCount(this.searchQuery).subscribe(res => {
        console.log(res);
        
        this.busy = false;
        this.reportDataTab=true
        this.reportChartTab=true
        this.activeIndex = [0,1, 2];
        this.prepareChart(res);
        this.reportChartData = true;
        this.eSignDocData = [];
        this.memoDocData = [];
        this.searchQuery.exportData = res;
      }, err => {
        this.busy = false;
      });
    } else if (this.report.search.reportType === 'workflow' && this.report.search.category === 'sent') {
      this.chartOptions = this.otherChartOptions;
      this.chartOptions.title.text = "Sent Workflow Chart";
      this.busy = true;
      this.rs.getOrgSentitemCount(this.searchQuery).subscribe(res => {
        this.busy = false;
        this.reportDataTab=true
        this.reportChartTab=true
        this.activeIndex = [0,1, 2];
        this.prepareChart(res);
        this.reportChartData = true;
        this.eSignDocData = [];
        this.memoDocData = [];
        this.searchQuery.exportData = res;
      }, err => {
        this.busy = false;
      });
    } else if (this.report.search.reportType === 'doc') {
      this.chartOptions = this.otherChartOptions;
      this.chartOptions.title.text = "Documents Created Chart";
      if (this.report.search.userSearchText && this.report.search.userSearchText.fulName)
        this.chartOptions.title.text = "Documents Created By Chart: " + this.report.search.userSearchText.fulName;
      // added on 18032019
      // delete this.searchQuery.orgCode;
      this.searchQuery.userName = this.user.fulName;
      this.busy = true;
      this.rs.getOrgDocumentCount(this.searchQuery).subscribe(res => {
        this.busy = false;
        let data:any;
       // this.busy = false;
        data = _.cloneDeep(res);
        let count = 0;
        for (let item of data) {
          if (item.orgRoleName && item.orgRoleName == 'No Role') {
            count += 1;
            item.orgRoleName += ' ' + count;
          }
        }
        this.reportDataTab=true;
        this.reportChartTab=true
        this.activeIndex = [0,1, 2];
        this.prepareDocChart(data);
        this.reportChartData = true;
        this.eSignDocData = [];
        this.memoDocData = [];
        this.searchQuery.exportData = data;
      }, err => {
        this.busy = false;
      });
    } else if (this.report.search.reportType === 'eSignDoc') {
      this.expandedRowsGroups = [];
      this.searchQuery.category = this.report.search.category;
      if (this.searchQuery.category == 'ALL') {
        this.colHeadersESign = [
          { field: 'empName', header: 'User Display Name' },
          { field: 'empTitle', header: 'Designation', hidden: true },
          { field: 'empNo', header: 'KOC ID' },
          { field: 'orgCode', header: 'Organization Code' },
          { field: 'reqDate', header: 'Request Date', sortField: 'reqDate2' },
          { field: 'signDate', header: 'Signed Date', sortField: 'signDate2' },
          { field: 'status', header: 'Status' },
          { field: 'type', header: 'Type' },
        ];
      } else {
        this.colHeadersESign = [
          { field: 'empName', header: 'User Display Name' },
          { field: 'empTitle', header: 'Designation', hidden: true },
          { field: 'empNo', header: 'KOC ID' },
          { field: 'orgCode', header: 'Organization Code' },
          { field: 'reqDate', header: 'Request Date', sortField: 'reqDate2' },
          { field: 'signDate', header: 'Signed Date', sortField: 'signDate2' }
        ];
      }
      this.busy = true;
      this.rs.getOrgESignItems(this.searchQuery).subscribe(res => {
        this.busy = false;
        this.reportDataTab=true;
        this.activeIndex = [0,1];
        this.assignDate(res);
        this.reportCount = [];
        this.eSignData = true;
        this.searchQuery.eSignData = res;
      }, err => {
        this.busy = false;
      });
    } else if (this.report.search.reportType === 'memo') {
      this.expandedRowsGroups = [];
      this.searchQuery.category = this.report.search.category;
      if (this.searchQuery.category == 'ALL') {
        this.colHeadersMemo = [
          { field: 'memoEmpName', header: 'User Display Name' },
          { field: 'reqDate', header: 'Request Date', sortField: 'reqDate2' },
          { field: 'memoLang', header: 'Memo Lang', hidden: true },
          { field: 'memoType', header: 'Memo Type' },
          { field: 'memoDate', header: 'Memo Date', sortField: 'memoDate2' },
          { field: 'signUser', header: 'From User' },
          { field: 'orgCode', header: 'Org Code' },
          { field: 'status', header: 'Status' }
        ];
      } else {
        this.colHeadersMemo = [
          { field: 'memoEmpName', header: 'User Display Name' },
          { field: 'reqDate', header: 'Request Date', sortField: 'reqDate2' },
          { field: 'memoLang', header: 'Memo Lang', hidden: true },
          { field: 'memoType', header: 'Memo Type' },
          { field: 'memoDate', header: 'Memo Date', sortField: 'memoDate2' },
          { field: 'signUser', header: 'From User' },
          { field: 'orgCode', header: 'Org Code' },
          { field: 'status', header: 'Status' }
        ];
      }
      this.busy = true;
      this.rs.getOrgMemoItems(this.searchQuery).subscribe(res => {
        this.busy = false;
        this.reportDataTab=true
        this.activeIndex = [0,1];
        this.assignMemoDate(res);
        this.reportCount = [];
        this.memoData = true;
        this.searchQuery.memoData = res;
      }, err => {
        this.busy = false;
      });
    } else if (this.report.search.reportType === 'all') {
      this.chartOptions = this.allChartOptions;
      this.chartOptions.title.text = "All Report Chart";
      this.busy = true;
      this.rs.getOrgAllReportCount(this.searchQuery).subscribe(res => {
        this.busy = false;
        this.reportDataTab=true;
        this.reportChartTab=true;
        this.activeIndex = [0,1, 2];
        this.prepareAllChartSeries(res);
        this.allData = true;
        this.reportChartData = true;
        this.eSignDocData = [];
        this.memoDocData = [];
        this.searchQuery.exportAllData = res;
      }, err => {
        this.busy = false;
      });
    }
    this.report.options.previousSearchedReportType = this.report.search.reportType;
    this.report.options.previousSearchedCategory = this.report.search.category
  }

  getRoleHeader() {
    if (this.report.search.reportType === 'workflow') {
      return 'User/Role Name';
    } else {
      return 'Role Name'
    }
  }

  getLabelByOrg() {
    if (this.searchQuery.type && (this.searchQuery.type === 'DIR' || this.searchQuery.type.toLowerCase() === 'directorate')) {
      return 'Group Name';
    } else {
      return 'Team Name'
    }
  }

  assignDate(data) {
    data.map((d) => {
      d.signDate2 = this.coreService.getTimestampFromDate(d.signDate, null, '/');
      d.reqDate2 = this.coreService.getTimestampFromDate(d.reqDate, null, '/');
      d.recordGroupName = d.orgName ? d.orgName : 'Other';
      if (this.expandedRowsGroups.indexOf(d.recordGroupName) == -1)
        this.expandedRowsGroups.push(d.recordGroupName);
    });
    this.eSignDocData = data;
  }


  assignMemoDate(data) {
    data.map((d) => {
      d.memoDate2 = this.coreService.getTimestampFromDate(d.memoDate, null, '/');
      d.reqDate2 = this.coreService.getTimestampFromDate(d.reqDate, null, '/');
      d.recordGroupName = d.orgName ? d.orgName : 'Other';
      if (this.expandedRowsGroups.indexOf(d.recordGroupName) == -1)
        this.expandedRowsGroups.push(d.recordGroupName);
    });
    this.memoDocData = data;
  }

  onTabOpen(event) {
    if (event.index === 0) {
    }
  }

  getChartLabelText(d) {
    if (this.searchQuery.type == "User") {
      return d.orgRoleName;
    } else {
      return d.orgTeamName;
    }
  }

  prepareDocChart(data) {
    this.chartLegend = false;
    this.currentPage = 0;
    let reportCountSorted = data; //_.orderBy(data, ['count'],['desc']);
    this.reportCount = data;
    this.report.options.chartTotal = 0;
    reportCountSorted.map((unit) => {
      this.report.options.chartTotal += unit.count;
    });
    let maxRows = 0;
    let page = 0;
    let index = 0;
    this.report.options.chartPages = { 0: { chartLabels: [], chartData: [{ data: [],backgroundColor: [], }], chartColors: [{ backgroundColor: [] }] } };
    this.report.options.chartPageCount = 0;
    reportCountSorted.map((d) => {
      if (d.count >= 0 && maxRows < 26) {
        maxRows++;
        this.report.options.chartPages[page].chartLabels.push(this.getChartLabelText(d));
        this.report.options.chartPages[page].chartData[0].data.push(d.count);
        this.report.options.chartPages[page].chartData[0].backgroundColor.push(this.rs.getRandomMaterialColor(index));
        debugger;
        if (maxRows === 25 && maxRows < reportCountSorted.length) {
          maxRows = 0;
          page++;
          this.report.options.chartPages[page] = { chartLabels: [], chartData: [{ data: [],backgroundColor: [] }], chartColors: [{ backgroundColor: [] }] };
          this.report.options.chartPageCount++;
        }
        index++;
      }
    });
    if (this.chart && this.chart.chart) {
      this.chart.chart.config.data.labels = this.report.options.chartPages[this.currentPage].chartLabels;
    }
  }
  prepareChart(data) {
    this.chartLegend = false;
    this.currentPage = 0;
    let reportCountSorted = data; //_.orderBy(data, ['count'],['desc']);
    this.reportCount = data;
    this.report.options.chartTotal = 0;
    reportCountSorted.map((unit) => {
      this.report.options.chartTotal += unit.count;
    });
    let maxRows = 0;
    let page = 0;
    let index = 0;
    this.report.options.chartPages = { 0: { chartLabels: [], chartData: [{ data: [],backgroundColor: [] }], chartColors: [{ backgroundColor: [] }] } };
    this.report.options.chartPageCount = 0;
    reportCountSorted.map((d) => {
      if (maxRows < reportCountSorted.length) {
        maxRows++;
        this.report.options.chartPages[page].chartLabels.push(this.getChartLabelText(d));
        this.report.options.chartPages[page].chartData[0].data.push(d.count);
        this.report.options.chartPages[page].chartData[0].backgroundColor.push(this.rs.getRandomMaterialColor(index));
        index++;
      }
    });
    if (this.chart && this.chart.chart) {
      this.chart.chart.config.data.labels = this.report.options.chartPages[this.currentPage].chartLabels;
    }
  }

  prepareAllChartSeries(data) {
    this.currentPage = 0;
    this.chartLegend = true;
    let reportCountSorted = data;//_.orderBy(data, ['inboxCount', 'sentCount', 'docCount', 'eSignCount'],['desc','desc','desc','desc']);
    this.reportCount = reportCountSorted;
    this.report.options.chartTotal = 0;
    this.report.options.allTotal.receivedCount = _.sumBy(reportCountSorted, 'inboxCount');
    this.report.options.allTotal.sentCount = _.sumBy(reportCountSorted, 'sentCount');
    this.report.options.allTotal.docCount = _.sumBy(reportCountSorted, 'docCount');
    this.report.options.allTotal.eSignCount = _.sumBy(reportCountSorted, 'eSignCount');
    let maxRows = 0;
    let page = 0;
    this.report.options.chartPages = {
      0: {
        chartLabels: [], chartData: [{ data: [], label: 'Received',backgroundColor: ['#82B65F'] }, { data: [], label: 'Sent' ,backgroundColor: ['#AC3E31']},
        { data: [], label: 'Documents' ,backgroundColor: ['#5C83C9'] }, { data: [], label: 'eSign',backgroundColor: ['#E98949'] }],
        chartColors: [{ backgroundColor: [] }, { backgroundColor: [] },
        { backgroundColor: [] }, { backgroundColor: [] }]
      }
    };
    this.report.options.chartPageCount = 0;
    // const randomColor1 = this.rs.getRandomMaterialColor(0);
    // const randomColor2 = this.rs.getRandomMaterialColor(1);
    // const randomColor3 = this.rs.getRandomMaterialColor(2);
    // const randomColor4 = this.rs.getRandomMaterialColor(3);
    const randomColor1 = "#82B65F";
    const randomColor2 = "#AC3E31";
    const randomColor3 = "#5C83C9";
    const randomColor4 = "#E98949";
    reportCountSorted.map((d) => {
      if (maxRows < reportCountSorted.length) {
        if ((d.inboxCount + d.sentCount + d.docCount + d.eSignCount) > 0 && maxRows < 9) {
          maxRows++;
          this.report.options.chartPages[page].chartLabels.push(d.orgTeamName);
          this.report.options.chartPages[page].chartData[0].data.push(d.inboxCount);
          this.report.options.chartPages[page].chartData[1].data.push(d.sentCount);
          this.report.options.chartPages[page].chartData[2].data.push(d.docCount);
          this.report.options.chartPages[page].chartData[3].data.push(d.eSignCount);
          //this.report.options.chartPages[page].chartColors[0].backgroundColor.push('#d7ccc8');
          this.report.options.chartPages[page].chartColors[0].backgroundColor.push(randomColor1);
          this.report.options.chartPages[page].chartColors[1].backgroundColor.push(randomColor2);
          this.report.options.chartPages[page].chartColors[2].backgroundColor.push(randomColor3);
          this.report.options.chartPages[page].chartColors[3].backgroundColor.push(randomColor4);
          if (maxRows === 8 && maxRows < reportCountSorted.length) {
            maxRows = 0;
            page++;
            this.report.options.chartPages[page] = {
              chartLabels: [], chartData: [{ data: [], label: 'Received',backgroundColor: ['#82B65F'] }, { data: [], label: 'Sent',backgroundColor: ['#AC3E31'] },
              { data: [], label: 'Documents',backgroundColor: ['#5C83C9'] }, { data: [], label: 'eSign',backgroundColor: ['#E98949'] }],
              chartColors: [{ backgroundColor: [] }, { backgroundColor: [] },
              { backgroundColor: [] }, { backgroundColor: [] }]
            };
            this.report.options.chartPageCount++;
          }
        }
      }
    });
    if (this.chart && this.chart.chart) {
      this.chart.chart.config.data.labels = this.report.options.chartPages[this.currentPage].chartLabels;
    }
  }

  loadNext() {
    this.currentPage++;
    this.chart.chart.config.data.labels = this.report.options.chartPages[this.currentPage].chartLabels;
  }

  loadPrevious() {
    this.currentPage--;
    this.chart.chart.config.data.labels = this.report.options.chartPages[this.currentPage].chartLabels;
  }

  exportToPdf() {
    this.searchQuery.exportType = 'pdf';
    this.searchQuery.userName = this.user.fulName;
    const mimeType = 'application/pdf';
    let fileName = 'Inbox_Workflow_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
    let serviceURL = 'exportOrgWorkitemCount';
    if (this.report.options.previousSearchedReportType === 'workflow' && this.report.options.previousSearchedCategory === 'received') {
      fileName = 'Inbox_Workflow_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      serviceURL = 'exportOrgWorkitemCount';
    } else if (this.report.options.previousSearchedReportType === 'workflow' && this.report.options.previousSearchedCategory === 'sent') {
      fileName = 'Sent_Workflow_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      serviceURL = 'exportOrgSentitemCount';
    } else if (this.report.options.previousSearchedReportType === 'doc') {
      fileName = 'Documents_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      serviceURL = 'exportOrgDocumentCount';
    } else if (this.report.options.previousSearchedReportType === 'eSignDoc') {
      this.searchQuery.category = this.report.search.category;
      fileName = 'eSign_Documents_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      serviceURL = 'exportOrgESignItems';
    } else if (this.report.options.previousSearchedReportType === 'memo') {
      this.searchQuery.category = this.report.search.category;
      fileName = 'Memos_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      serviceURL = 'exportOrgMemoItems';
    } else if (this.report.options.previousSearchedReportType === 'all') {
      fileName = 'All_Report_' + this.coreService.getDateTimeForExport() + '.pdf';
      serviceURL = 'exportOrgAllReportCount';
    }
    this.busy = true;
    this.rs[serviceURL](this.searchQuery).subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: mimeType });
      saveAs(file, fileName);
    }, err => {
      this.busy = false;
    });
  }

  exportToExcel() {
    this.searchQuery.exportType = 'excel';
    this.searchQuery.userName = this.user.fulName;
    const mimeType = 'application/vnd.ms-excel';
    let fileName = 'Inbox_Workflow_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
    let serviceURL = 'exportOrgWorkitemCount';
    if (this.report.options.previousSearchedReportType === 'workflow' && this.report.options.previousSearchedCategory === 'received') {
      fileName = 'Inbox_Workflow_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      serviceURL = 'exportOrgWorkitemCount';
    } else if (this.report.options.previousSearchedReportType === 'workflow' && this.report.options.previousSearchedCategory === 'sent') {
      fileName = 'Sent_Workflow_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      serviceURL = 'exportOrgSentitemCount';
    } else if (this.report.options.previousSearchedReportType === 'doc') {
      fileName = 'Documents_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      serviceURL = 'exportOrgDocumentCount';
    } else if (this.report.options.previousSearchedReportType === 'eSignDoc') {
      this.searchQuery.category = this.report.search.category;
      fileName = 'eSign_Documents_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      serviceURL = 'exportOrgESignItems';
    } else if (this.report.options.previousSearchedReportType === 'memo') {
      this.searchQuery.category = this.report.search.category;
      fileName = 'Memos_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      serviceURL = 'exportOrgMemoItems';
    } else if (this.report.options.previousSearchedReportType === 'all') {
      fileName = 'All_Report_' + this.coreService.getDateTimeForExport() + '.xlsx';
      serviceURL = 'exportOrgAllReportCount';
    }
    this.busy = true;
    this.rs[serviceURL](this.searchQuery).subscribe(res => {
      this.busy = false;
      const file = new Blob([res], { type: mimeType });
      saveAs(file, fileName);
    }, err => {
      this.busy = false;
    });
  }

  checkedChanged(event) {
    this.report.search.fromDate = undefined;
    this.report.search.toDate = undefined;
    if (event) {
      //this.report.search.fromDate = new Date();
      this.report.search.fromDate = new Date(Date.now() - 864e5);//24*60*60*1000
    }
  }
  onFocusToDate(){
    const todatemin = new Date(this.report.search.fromDate);
    this.report.search.minDate = todatemin;
  }

  searchUsers(event) {
    const searchQuery: any = {
      userType: 'USER',
      filter: '',
      orgCode: this.user.orgCode
    };
    if (this.user.isReportAdmin === 'Y') {
      delete searchQuery.orgCode
    }
    searchQuery[this.report.search.searchType] = event.query;
    if (event.query.length > 2) {
      this.busy = true;
      this.us.searchOrgECMUsers(searchQuery).subscribe(data => {
        this.busy = false;
        this.report.search.searchSuggestions = data;
      }, err => {
        this.busy = false;
      });
    }
  }

  enterUserName() {
    this.report.search.userSearchText = undefined;
    this.searchQuery.userType = 'ROLE';
    if(this.report.search.roleSearchText){
     this.searchQuery.EmpNo = this.report.search.roleSearchText.id;
    }
  }

  usersSelected(event) {
    this.searchQuery.userType = 'USER';
    this.searchQuery.EmpNo = event.EmpNo;
    this.searchQuery.orgCode = event.orgCode;
    this.report.search.orgUnitSelected = undefined;
  }

  onBlurUser() {
    // this.clearDirSelection();
    //this.clearUserSelection();
  }

  onSearchTypeChanged(event) {
    this.report.search.searchSuggestions = [];
    this.report.search.userSearchText = undefined;
  }

  /*  searchRole(event){
      const searchQuery: any = {
        userType : 'ROLE',
        filter : '',
        orgCode : this.user.orgCode
      };
      searchQuery.userName = event.query;
      const subscription = this.us.searchEcmUsers(searchQuery).subscribe(data => {
          this.report.search.roleSearchSuggestions = data;
        });
      this.coreService.progress = {busy: subscription, message: '', backdrop: true};
      this.addToSubscriptions(subscription)
    }*/

  //added on 18032019
  onDirChange(event) {
    this.refreshTree();
    this.user.isReportAdmin === 'N' ? this.getRoleList(this.user.orgCode) : this.getRoleList(event.value.orgCode);
    this.report.options.groupList = [];
    this.report.search.groupSelected = undefined;
    this.report.options.teamList = [];
    this.report.search.teamSelected = undefined;
    this.report.options.roleList = [];
    this.report.search.roleSearchText = undefined;
    let subscription;
    this.busy = true;
    this.as.getSubLevelOrgUnits(event.value.id).subscribe(res => {
      this.busy = false;
      res.map((role) => {
        this.report.options.groupList.push({
          label: role.desc.length>=55? role.desc.substring(0,55)+'...': role.desc,
          value: { id: role.id, orgCode: role.orgCode, parent: role.parent, type: role.type,desc:role.desc }
        })
      });
    }, err => {
      this.busy = false;
    });
  }

  onGroupChange(event) {
    if (this.user.isReportAdmin === 'Y') {
      this.gerTopOrgTree();
    } else if (this.report.options.supervisorTreeLastNode &&
      (this.report.options.supervisorTreeLastNode.data.type === 'DIR' ||
        this.report.options.supervisorTreeLastNode.data.type.toLowerCase() === 'directorate')) {
    } else {
      this.gerSupervisorTree();
    }
    this.user.isReportAdmin === 'N' ? this.getRoleList(event.value.orgCode) : this.getRoleList(event.value.orgCode);
    this.report.options.teamList = [];
    this.report.search.teamSelected = undefined;
    this.report.options.roleList = [];
    this.report.search.roleSearchText = undefined;
    let subscription;
    this.busy = true;
    this.as.getSubLevelOrgUnits(event.value.id).subscribe(res => {
      this.busy = false;
      res.map((role) => {
        this.report.options.teamList.push({
          label: role.desc.length>=55? role.desc.substring(0,55)+'...': role.desc,
          value: { id: role.id, orgCode: role.orgCode, parent: role.parent, type: role.type,desc:role.desc }
        })
      });
    }, err => {
      this.busy = false;
    });
  }
  // checkDropDownItemCount(type){
  //   if(type==='DIR'){
  //      this.isDirFilterShown = this.report.options.dirList.length > 0;
  //   }
  //   else if(type==='GROUP'){
  //     this.isGroupFilterShown = this.report.options.groupList.length > 0;
  //   }
  //   else if(type==='TEAM'){
  //     this.isTeamFilterShown = this.report.options.teamList.length > 0;
  //   }
  //    else if(type==='ROLE'){
  //     this.isRoleFilterShown = this.report.options.roleList.length > 0;
  //   }
  // }

  onTeamChange(event) {
    if (this.user.isReportAdmin === 'Y') {
      this.gerTopOrgTree();
    } else if (this.report.options.supervisorTreeLastNode &&
      (this.report.options.supervisorTreeLastNode.data.type.toLowerCase() === 'group' ||
        this.report.options.supervisorTreeLastNode.data.type === 'DIR' ||
        this.report.options.supervisorTreeLastNode.data.type.toLowerCase() === 'directorate')) {
    } else {
      this.gerSupervisorTree();
    }
    this.getRoleList(event.value.orgCode);
  }

  searchRoleSelected(event) {
    this.searchQuery.userType = 'ROLE';
    this.searchQuery.EmpNo = event.id;
    this.searchQuery.orgCode = event.orgCode;
    this.report.search.orgUnitSelected = undefined;
  }

  searchOrgUnit(event) {
    this.busy = true;
    this.as.searchOrgUnits(event.query).subscribe(data => {
      this.busy = false;
      this.report.search.orgUnitSearchSuggestions = data;
    }, err => {
      this.busy = false;
    });
  }

  searchOrgUnitSelected(selected) {
    this.searchQuery.userType = ' ';
    this.report.search.orgUnitSelected = selected.orgCode;
  }

  clearSearchobject() {
    this.report.search = {};
    this.searchQuery = {};
    this.refreshTree();
    this.reportChartData = false;
    this.eSignData = false;
    this.memoData = false;
    this.allData = false;
    this.reportDataTab=false;
    this.reportChartTab=false;
    this.activeIndex = [0];
    this.user.isReportAdmin !== 'Y' ? this.getRoleList(this.user.orgCode) : null;
  }

  refreshTree() {
    if (this.user.isReportAdmin === 'Y') {
      this.gerTopOrgTree();
    } else {
      this.gerSupervisorTree();
    }
  }

  reportTypeChanged(event) {
    if (this.user.isReportAdmin === 'Y') {
      let subscription;
      this.busy = true;
      this.as.getSubLevelOrgUnits(1).subscribe(res => {//1 in KOC env and 3 in dev env
        this.busy = false;
        this.report.options.dirList = [];
        res.map((role) => {
          this.report.options.dirList.push({
            label:role.desc.length>=55?role.desc.substring(0,55)+'...': role.desc,
            value: { id: role.id, orgCode: role.orgCode, parent: role.parent, type: role.type,desc:role.desc}
          })
        });
      }, err => {
        this.busy = false;
      });
    }
    if (this.report && this.report.search.reportType === 'eSignDoc') {
      this.report.search.category = 'SIGNED';
    } else if (this.report && this.report.search.reportType === 'doc') {
      this.report.search.category = 'created';
    } else {
      this.report.search.category = undefined;
    }
    this.report.search.roleSearchText = undefined;
    //this.report.search.userSearchText = undefined;
    this.searchQuery.category = undefined;
    //this.user.isReportAdmin==='Y' ? this.clearDirSelection(): null;
    //this.refreshTree();
  }

  clearDirSelection() {
    this.report.search.dirSelected = undefined;
    this.report.search.groupSelected = undefined;
    this.report.search.teamSelected = undefined;
    this.report.search.roleSearchText = undefined;
    this.user.isReportAdmin === 'N' ? this.getRoleList(this.user.orgCode) : null;
   // this.checkDropDownItemCount('GROUP');
  }

  clearGroupSelection() {
    this.report.search.groupSelected = undefined;
    this.report.search.teamSelected = undefined;
    this.report.search.roleSearchText = undefined;
    this.user.isReportAdmin === 'N' ? this.getRoleList(this.user.orgCode) : this.getRoleList(this.report.search.dirSelected.orgCode);
  }

  clearTeamSelection() {
    this.report.search.teamSelected = undefined;
    this.report.search.roleSearchText = undefined;
    this.user.isReportAdmin === 'N' ? this.getRoleList(this.report.search.groupSelected.orgCode) : this.getRoleList(this.report.search.groupSelected.orgCode);
  }

  textAlignCenter() {
    return 'textAlignCenter';
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 9 && this.report.search.searchSuggestions && this.report.search.searchSuggestions.length === 0) {
      this.report.search.userSearchText = undefined;
    }
  }

  @HostListener('click', ['$event'])
  uiClick(event: MouseEvent) {
    if (this.report.search.userSearchText && !(this.report.search.searchSuggestions && this.report.search.searchSuggestions.length > 0)) {
      //this.report.search.userSearchText = undefined;
    }
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.currentPage = 0;
    this.clearSubscriptions();
    this.subscriptions = [];
    //this.report.roles.roleTree = [];
    this.tmpRoleTree = [];
    this.report = {};
    this.searchQuery = {};
  }
}
