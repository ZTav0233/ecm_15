import { Component } from '@angular/core';
// service
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'search-component',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'Advance Search' }
    ]);
  }
}