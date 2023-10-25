import { Component, OnInit } from '@angular/core';
import {BreadcrumbService} from "../../../services/breadcrumb.service";
import * as globalv from "../../../global.variables";

@Component({
  selector: 'app-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.css']
})
export class ShortcutsComponent implements OnInit {
 private entry_app_url: string;
  constructor(private breadcrumbService: BreadcrumbService) {
     this.entry_app_url = globalv.entry_app_url;
  }

  ngOnInit() {
     this.breadcrumbService.setItems([
      {label: 'Shortcuts'}
    ]);
  }
  openEntryApp() {
    window.open(this.entry_app_url);
  }
  destroyKeys(){
    Object.keys(this).map(k => {
     //this[k] = null;
      delete this[k];
     })
  }
  ngOnDestroy() {
     this.destroyKeys();


  }

}
