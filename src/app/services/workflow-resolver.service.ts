import 'rxjs';
import 'rxjs';
import {Injectable} from '@angular/core';
import {
  Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {UserService} from "./user.service";
import {WorkflowService} from "./workflow.service";
import {ContentService} from "./content.service";

@Injectable()
export class WorkflowItemsCountResolverService implements Resolve<any> {
  constructor(private ws: WorkflowService, private us: UserService, private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let currentUser = this.us.getCurrentUser(),
      page = route.data['page'];
    return this.ws.getTabsCounter(currentUser.EmpNo, page);
  }
}

@Injectable()
export class WorkflowItemsResolverService implements Resolve<any> {
  constructor(private ws: WorkflowService, private us: UserService, private router: Router,
              private contentService:ContentService) {
  }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let page = route.data['page'], filterQuery = null;
    if (page === 'inbox') {
     /* // if coming from dashboard, route params will be there. use them to make dashboard filter query
      if (route.params && (route.params.hasOwnProperty('pageFrom') && route.params.pageFrom === 'dashboard')) {
        filterQuery = this.ws.createRequestBody(route.params);
        //this.ws.setAllDashboardFilterQuery(filterQuery);
      }
      return this.ws.searchInboxNew(filterQuery);*/
    } else if (page === 'sent') {

    } else if (page === 'archive') {

    } else if (page === 'actioned') {

    } else if (page === 'launch') {
      if (!this.contentService.entryTemplatesListForSearchAndAdd.valueFetchedFromServer){
        this.contentService.entryTemplatesListForSearchAndAdd.valueFetchedFromServer = true;
        return await this.contentService.getEntryTemplatesForSearchAndAddAsync().then(data=>{
          this.contentService.entryTemplatesListForSearchAndAdd.addList=data.addList;
          this.contentService.entryTemplatesListForSearchAndAdd.searchList=data.searchList;
        });
      } else {
        return this.contentService.entryTemplatesListForSearchAndAdd;
      }
    }
  }
}
