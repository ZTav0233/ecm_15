import {Component} from '@angular/core';
import {BrowserEvents} from "../../services/browser-events.service";
@Component({
  templateUrl: './main.component.html',
})
export class MainComponent{
  constructor(private bs:BrowserEvents) {
     this.bs.switchBackContentSearch.emit();
  }
}
