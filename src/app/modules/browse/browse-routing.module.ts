import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowseComponent } from './browse.component';
import { AddDocumentComponent } from './add-document/add-document.component';
import { BrowseDocumentComponent } from './browse-documents/browse-document.component';
import { FavouriteFoldersComponent } from './favourite-folders/favourite-folders.component';
import { UpdateDocumentComponent } from "./update-document/update-document.component";
export const routes: Routes = [
    {
        path: '', component: BrowseComponent,
        children: [
            { path: 'favourite-folders', component: FavouriteFoldersComponent },
            { path: 'browse-folders', component: BrowseDocumentComponent },
            { path: 'add-doc', component: AddDocumentComponent },
            { path: 'update-doc', component: UpdateDocumentComponent },
            { path: '', redirectTo: 'browse-folders', pathMatch: 'full' },
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BrowseRoutingModule { }