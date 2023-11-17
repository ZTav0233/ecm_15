import {Component, ComponentRef, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BrowserEvents} from "../../services/browser-events.service";

@Component({
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent  {
    constructor(private bs:BrowserEvents) {
    this.bs.switchBackContentSearch.emit();
  }

}

