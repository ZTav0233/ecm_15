import {BreadcrumbService} from '../../services/breadcrumb.service';
import {Component, OnInit} from '@angular/core';
import {BrowserEvents} from "../../services/browser-events.service";

@Component({
  selector: 'app-administration-component',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.css'],
})
export class AdministrationComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService,private bs:BrowserEvents) {

  }

  ngOnInit() {
    this.breadcrumbService.setItems([
      {label: 'Administration'}
    ]);
    this.bs.switchBackContentSearch.emit();
  }


  tabChange(event) {

  }
}
