import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RecentsComponent } from '../../components/shortcut-components/recents/recents.component';
import { FavouritesComponent } from '../../components/shortcut-components/favourites/favourites.component';
import { TeamsharedDocsComponent } from '../../components/shortcut-components/teamshared-docs/teamshared-docs.component';
import { ShortcutsComponent } from '../../components/shortcut-components/shortcuts/shortcuts.component';
import { HelpComponent } from '../../components/shortcut-components/help/help.component';

const routes: Routes = [
  {
    path: '', // The root path
    component: MainComponent,
    children: [
      { path: '', component: DashboardComponent }, // Main dashboard
      { path: 'favourites', component: FavouritesComponent },
      { path: 'recents', component: RecentsComponent },
      { path: 'teamshared', component: TeamsharedDocsComponent },
      { path: 'shortcuts', component: ShortcutsComponent },
      { path: 'help', component: HelpComponent },
      // Remove the following lines if they are redundant:
      // { path: 'dashboard', redirectTo: '/dashboard' },
      // { path: 'dashboard', redirectTo: '/' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {}
