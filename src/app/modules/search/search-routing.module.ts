import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';
import { SimpleSearchComponent } from './simple-search/simple-search.component';
import { AdvanceSearchComponent } from './advance-search/advance-search.component';

const routes: Routes = [
    {
      path: '', component: SearchComponent, pathMatch: 'prefix',
      children: [
        { path: 'simple-search/:query /:oper', component: SimpleSearchComponent },
        {path: 'simple-search', component: SimpleSearchComponent},
        {path: 'advance-search', component: AdvanceSearchComponent}
      ]
    },
  
  ];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SearchRoutingModule { }