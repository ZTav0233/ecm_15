import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InboxComponent } from './inbox/inbox.component';
import { LaunchComponent } from './launch/launch.component';
import { SentComponent } from './sent/sent.component';
import { DraftComponent } from './drafts/draft.component';
import { WorkflowComponent } from './workflow.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { ArchiveComponent } from './archive/archive.component';
import { FilterResultComponent } from './filter-result/filter-result.component';
import { WorkflowItemsResolverService } from '../../services/workflow-resolver.service';
import { MemoComponent } from './memo/memo.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowComponent,
    children: [
      { path: '', redirectTo: 'inbox', pathMatch: 'full', data: { shouldReuse: true } },
      { path: 'inbox', component: InboxComponent, data: { shouldReuse: true } },
      { path: 'draft', component: DraftComponent, data: { shouldReuse: false } },
      { path: 'sent', component: SentComponent, data: { shouldReuse: true } },
      { path: 'archive', component: ArchiveComponent, data: { shouldReuse: true } },
      { path: 'actioned', component: FilterResultComponent, data: { shouldReuse: true } },
      { path: 'inbox/taskdetail', component: TaskDetailComponent, data: { shouldReuse: false } },
      { path: 'inbox-new/taskdetail', component: TaskDetailComponent, data: { shouldReuse: false } },
      { path: 'sent/taskdetail', component: TaskDetailComponent, data: { shouldReuse: false } },
      { path: 'archive/taskdetail', component: TaskDetailComponent, data: { shouldReuse: false } },
      { path: 'actioned/taskdetail', component: TaskDetailComponent, data: { shouldReuse: false } },
      
      { path: 'launch/:actionType', component: LaunchComponent, data: { shouldReuse: false, page: 'launch' },
        resolve: { entryTemplateForSearchAndAdd: WorkflowItemsResolverService }},
      { path: 'launch', component: LaunchComponent,data: { shouldReuse: false, page: 'launch' },
        resolve: { entryTemplateForSearchAndAdd: WorkflowItemsResolverService }},
      { path: 'memo', component: MemoComponent },
      { path: 'memo/:actionType', component: MemoComponent, data: { shouldReuse: false, page: 'launch' },},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {}
