import {Component, OnDestroy, OnInit} from '@angular/core';
import {BrowserEvents} from '../../services/browser-events.service';

@Component({
  selector: 'browse-component',
  templateUrl: './browse.component.html',
})
export class BrowseComponent implements OnInit,OnDestroy{
 constructor(private bs:BrowserEvents) {
  this.bs.switchBackContentSearch.emit();
  }
  ngOnInit() {
    //document.body.style.overflow = "hidden";
  }

  ngOnDestroy() {
    //document.body.style.overflow = "scroll";
  }
}
