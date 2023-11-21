import {Component, OnInit} from '@angular/core';
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {BrowserEvents} from "../../services/browser-events.service";
import {Router} from "@angular/router";

@Component({
  selector: 'settings-component',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit{
  public activeTab = 0;
  constructor(private breadcrumbService: BreadcrumbService,private bs:BrowserEvents,private router:Router) {
    this.bs.switchBackContentSearch.emit();
  }
  ngOnInit(){
    this.breadcrumbService.setItems([
        {label: 'Settings'}
      ]);
  }
  tabChange(event) {

  }
}
