import {Injectable} from '@angular/core';

import {MenuItem} from 'primeng/api';

@Injectable()
export class BreadcrumbService {

  //private itemsSource = new Subject<MenuItem[]>();

  public dashboardFilterQuery: any;
  public dashboardTabSelected: any;
  public fromDashboard: boolean;
  public sentDashboardFilterQuery: any;
  public actionedDashboardFilterQuery: any;
  //itemsHandler = this.itemsSource.asObservable();

  items = [];

  setItems(items: MenuItem[]) {
    this.items = [];
    for (let i = 0; i < items.length; i++) {
      this.items.push(items[i]);
    }
    //this.itemsSource.next(items);
  }

}
