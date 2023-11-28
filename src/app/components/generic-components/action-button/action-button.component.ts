import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';


@Component({
  selector: 'action-button',
  templateUrl: './action-button.component.html'
})
export class ActionButtonComponent implements OnInit, OnChanges {
  @Input() public activePage: any;
  @Input() public actions: any;
  @Input() public actionDisabled: boolean;
  @Input() public disableAction: any;
  @Input() public selectedItemLength: any;
  @Input() public tabStatus : any;
  @Input() public hasFilterRes: boolean;
  @Input() public userId: number;
  @Input() public activeTab: string;
  @Input() public totalTableRecords: number;
  @Input() public disableFilter = false;
  @Output() selectedAction = new EventEmitter();
  @Output() toggleFilter = new EventEmitter();
  @Output() clearFilter = new EventEmitter();
  public tieredItems: any[] = [];

  ngOnChanges() {
    this.tieredItems = [];
    if (this.activePage === 'sent') {
      this.actions.map((action, index) => {
        if (action === 'Archive') {
          this.tieredItems.push({
            label: 'Archive',
            icon: 'ui-icon-archive', command: (event) => {
              this.selectedAction.emit('Archive');
            },
            disabled: this.disableAction || this.tabStatus == 'INACTIVE'
          });
        } else if (action === 'Archive Before') {
          this.tieredItems.push({
            label: 'Archive Before',
            icon: 'ui-icon-today', command: (event) => {
              this.selectedAction.emit('Archive Before');
            },
            disabled: this.totalTableRecords > 0 ? false : true || this.tabStatus == 'INACTIVE'
          });
        } else if (action === 'Add-User') {
          this.tieredItems.push({
            label: 'Add-User',
            icon: 'ui-icon-person-add', command: (event) => {
              this.selectedAction.emit('Add-User');
            },
            disabled: this.disableAction || this.tabStatus == 'INACTIVE' || this.actionDisabled
          });
        } else if (action === 'Relaunch') {
          this.tieredItems.push({
            label: 'Relaunch',
            icon: 'ui-icon-near-me', command: (event) => {
              this.selectedAction.emit('Relaunch');
            },
            disabled: this.disableAction || this.selectedItemLength > 1 
          });
        } 
      });
      this.tieredItems.push({
        label: 'Filter',
        icon: 'ui-icon-filter-list', command: (event) => {
          this.toggleFilter.emit('toggled');
        },
        disabled: (!(this.totalTableRecords > 0 && !this.disableFilter))
      });
    }
    if (this.activePage === 'inbox') {
      this.actions.map((action, index) => {
        if (action === 'Finish') {
          this.tieredItems.push({
            label: 'Finish',
            icon: 'pi pi-minus-circle', command: (event) => {
              this.selectedAction.emit('Finish');
            },
            disabled: this.disableAction || this.tabStatus == 'INACTIVE'
          });
        } else if (action === 'Finish Before') {
          this.tieredItems.push({
            label: 'Finish Before',
            icon: 'pi pi-calendar', command: (event) => {
              this.selectedAction.emit('Finish Before');
            },
            disabled: this.totalTableRecords < 0  || this.tabStatus == 'INACTIVE'
          });
        } else if (action === 'Reply') {
          this.tieredItems.push({
            label: 'Reply',
            icon: 'fa fa-fw ui-icon-reply', command: (event) => {
              this.selectedAction.emit('Reply');
            },
            disabled: this.disableAction || this.selectedItemLength > 1 || this.tabStatus == 'INACTIVE'
          });
        } else if (action === 'Reply-All') {
          this.tieredItems.push({
            label: 'Reply-All',
            icon: 'fa fa-fw ui-icon-reply-all', command: (event) => {
              this.selectedAction.emit('Reply-All');
            },
            disabled: this.disableAction || this.selectedItemLength > 1 || this.tabStatus == 'INACTIVE' || this.actionDisabled
          });
        } else if (action === 'Forward') {
          this.tieredItems.push({
            label: 'Forward',
            icon: 'fa fa-fw ui-icon-forward', command: (event) => {
              this.selectedAction.emit('Forward');
            },
            disabled: this.disableAction || this.selectedItemLength > 1 || this.tabStatus == 'INACTIVE'
          });
        } else if (action === 'Relaunch') {
          this.tieredItems.push({
            label: 'Relaunch',
            icon: 'fa fa-fw ui-icon-near-me', command: (event) => {
              this.selectedAction.emit('Relaunch');
            },
            disabled: this.disableAction || this.selectedItemLength > 1 
          });
        } else if (action === 'Flag') {
          this.tieredItems.push({
            label: 'Flag',
            icon: 'fa fa-fw ui-icon-flag', command: (event) => {
              this.selectedAction.emit('Flag');
            },
            disabled: this.disableAction || this.tabStatus == 'INACTIVE'
          });
        } 
      });
      this.tieredItems.push({
        label: 'Filter',
        icon: 'fa fa-fw ui-icon-filter-list', command: (event) => {
          this.toggleFilter.emit('toggled');
        },
        disabled: (!(this.totalTableRecords > 0 && !this.disableFilter))
      });
    }
    if (this.activePage === 'archive') {
      this.tieredItems.push({
        label: 'Un-Archive',
        icon: 'fa fa-fw ui-icon-unarchive', command: (event) => {
          this.selectedAction.emit('UnArchive');
        },
        disabled: this.disableAction || this.tabStatus == 'INACTIVE'
      });
      this.tieredItems.push({
        label: 'Relaunch',
        icon: 'fa fa-fw ui-icon-near-me', command: (event) => {
          this.selectedAction.emit('Relaunch');
        },
        disabled: this.disableAction || this.selectedItemLength > 1 
      });
      this.tieredItems.push({
        label: 'Filter',
        icon: 'fa fa-fw ui-icon-filter-list', command: (event) => {
          this.toggleFilter.emit('toggled');
        },
        disabled: (!(this.totalTableRecords > 0 && !this.disableFilter))
      });
    }
    if (this.activePage !== 'draft') {
      if (this.hasFilterRes) {
        this.tieredItems.push({
          label: 'Reset',
          icon: 'fa fa-fw ui-icon-autorenew', command: (event) => {
            if (this.activePage === 'archive') {
              this.clearFilter.emit({ 'bool': true, 'id': this.userId + '@' + this.activeTab });
            } else {
              this.clearFilter.emit({ 'bool': true, 'id': this.userId });
            }
          }
        });
      }
    }
  }
  ngOnInit() { }
}
