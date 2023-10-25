import {Injectable, EventEmitter} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class BrowserEvents {
  // source Subjects
  emitclick = new EventEmitter<any>();
  removeCartClick = new EventEmitter<any>();
  folderclick = new EventEmitter<any>();
  folderdefault = new EventEmitter<any>();
  topLinkesClicked = new EventEmitter<any>();
  fileInClick = new EventEmitter<any>();
  addDocClick = new EventEmitter<any>();
  folderPath = new EventEmitter<any>();
  addDocFolderId = new EventEmitter<any>();
  sideNavChange = new EventEmitter<any>();
  docsSelected = new EventEmitter<any>();
  skipDocLaunch = new EventEmitter<any>();
  sendFolderDocs = new EventEmitter<any>();
  addDocPath = new EventEmitter<any>();
  addDocId = new EventEmitter<any>();
  closeAddDocModel = new EventEmitter<any>();
  clearSelectedDocs = new EventEmitter<any>();
  private searchTextChanged = new Subject<any>();
  openDocInfoPanel = new EventEmitter<any>();
  openDocTrackPanel = new EventEmitter<any>();
  changeFilterText = new EventEmitter<any>();
  openedWkitem = new EventEmitter<any>();
  switchBackContentSearch = new EventEmitter<any>();
  isRootFolShown = new EventEmitter<any>();
  inboxRefreshRequired = new EventEmitter<any>();
  sentRefreshRequired = new EventEmitter<any>();
  archiveRefreshRequired = new EventEmitter<any>();
  actionedRefreshRequired = new EventEmitter<any>();
  launchRefreshRequired = new EventEmitter<any>();
  getEntryTemplateForAddLazy = new EventEmitter<any>();
  openEditSecurityModel = new EventEmitter<any>();
  docDetailsModelTabIndex = new EventEmitter<any>();
  isFullAccessForDoc= new EventEmitter<any>();
  clearFilterAfterSearch= new EventEmitter<any>();
  clearFolderSelection= new EventEmitter<any>();
  setCartSelection= new EventEmitter<any>();
  removeExistingAttachement= new EventEmitter<any>();
  removeDraft= new EventEmitter<any>();
  setWfSubject= new EventEmitter<any>();
  setPageNoOnLoadMore= new EventEmitter<any>();
  // Observable streams
  emitClick$ = this.emitclick.asObservable();
  folderclick$ = this.folderclick.asObservable();
  folderdefault$ = this.folderdefault.asObservable();
  removeCartClick$ = this.removeCartClick.asObservable();
  topLinkesClicked$ = this.topLinkesClicked.asObservable();
  fileInClick$ = this.fileInClick.asObservable();
  addDocClick$ = this.addDocClick.asObservable();
  folderPath$ = this.folderPath.asObservable();
  addDocFolderId$ = this.addDocFolderId.asObservable();
  sideNavChange$ = this.sideNavChange.asObservable();
  docsSelected$ = this.docsSelected.asObservable();
  skipDocLaunch$ = this.skipDocLaunch.asObservable();
  sendFolderDocs$ = this.sendFolderDocs.asObservable();
  addDocPath$ = this.addDocPath.asObservable();
  addDocId$ = this.addDocId.asObservable();
  closeAddDocModel$ = this.closeAddDocModel.asObservable();
  clearSelectedDocs$ = this.clearSelectedDocs.asObservable();
  searchTextChanged$ = this.searchTextChanged.asObservable();
  openDocInfoPanel$ = this.openDocInfoPanel.asObservable();
  openDocTrackPanel$ = this.openDocTrackPanel.asObservable();
  changeFilterText$ = this.changeFilterText.asObservable();
  openedWkitem$ = this.openedWkitem.asObservable();
  switchBackContentSearch$ = this.switchBackContentSearch.asObservable();
  isRootFolShown$ = this.isRootFolShown.asObservable();
  inboxRefreshRequired$ = this.inboxRefreshRequired.asObservable();
  sentRefreshRequired$ = this.sentRefreshRequired.asObservable();
  archiveRefreshRequired$ = this.archiveRefreshRequired.asObservable();
  actionedRefreshRequired$ = this.actionedRefreshRequired.asObservable();
  launchRefreshRequired$ = this.launchRefreshRequired.asObservable();
  getEntryTemplateForAddLazy$ = this.getEntryTemplateForAddLazy.asObservable();
  openEditSecurityModel$ = this.openEditSecurityModel.asObservable();
  docDetailsModelTabIndex$ = this.docDetailsModelTabIndex.asObservable();
  isFullAccessForDoc$ = this.isFullAccessForDoc.asObservable();
  clearFilterAfterSearch$ = this.clearFilterAfterSearch.asObservable();
  setCartSelection$ = this.clearFolderSelection.asObservable();
  removeExistingAttachement$ = this.removeExistingAttachement.asObservable();
  removeDraft$ = this.removeDraft.asObservable();
  setWfSubject$ = this.setWfSubject.asObservable();
  setPageNoOnLoadMore$= new EventEmitter<any>();

  // Service Methods
  setWfsSubject(change: any) {
    this.setWfSubject.next(change);
  }
  setPageNosOnLoadMore(change: any) {
    this.setPageNoOnLoadMore.next(change);
  }
  isinboxRefreshRequired(change: any) {
    this.inboxRefreshRequired.next(change);
  }
  isarchiveRefreshRequired(change: any) {
    this.archiveRefreshRequired.next(change);
  }
  issentRefreshRequired(change: any) {
    this.sentRefreshRequired.next(change);
  }
  isactionedRefreshRequired(change: any) {
    this.actionedRefreshRequired.next(change);
  }
  isRootFoldShown(change: any) {
    this.isRootFolShown.next(change);
  }

  switchBackToContentSearch(change: any) {
    this.switchBackContentSearch.next(change);
  }
  openedWkitemId(change: any) {
    this.openedWkitem.next(change);
  }
  changeFilter(change: any) {
    this.changeFilterText.next(change);
  }

  emitClickScreen(change: any) {
    this.emitclick.next(change);
  }

  emitClickFolder(change: any) {
    this.folderclick.next(change);
  }

  emitDefaultFolder(change: any) {
    this.folderdefault.next(change);
  }

  removeCart(id: any) {
    this.removeCartClick.next(id);
  }

  emitTopLinkesClicked() {
    this.topLinkesClicked.next(null);
  }

  emitfileInClicked(change: any) {
    this.fileInClick.next(change);
  }

  emitAddDocClick() {
    this.addDocClick.next(null);
  }

  emitFolderPath(change: any) {
    this.folderPath.next(change);
  }

  emitaddDocFolderId(change: any) {
    this.addDocFolderId.next(change);
  }

  sideNavActionChange(change: any) {
    this.sideNavChange.next(change);
  }

  docSelected(change: any) {
    this.docsSelected.next(change);
  }

  launchSkipped(change: any) {
    this.skipDocLaunch.next(change);
  }

  sendDocs(change: any) {
    this.sendFolderDocs.next(change);
  }

  addDocPaths(change: any) {
    this.addDocPath.next(change);
  }

  addDocIds(change: any) {
    this.addDocId.next(change);
  }

  closeModel(change: any) {
    this.closeAddDocModel.next(change);
  }

  clearSelectedDoc(change: any) {
    this.clearSelectedDocs.next(change);
  }

  onSearchTextChanged(change: any) {
    this.searchTextChanged.next(change);
  }

  openDocInfoPanels(change: any) {
    this.openDocInfoPanel.next(change);
  }

  openDocTrackPanels(change: any) {
    this.openDocTrackPanel.next(change);
  }

  emitGetEntryTemplateForAddLazy(change: any) {
    this.getEntryTemplateForAddLazy.next(change);
  }
  openEditSecurityModels(change: any) {
    this.openEditSecurityModel.next(change);
  }
  setDocDetailsModelTabIndex(change: any) {
    this.docDetailsModelTabIndex.next(change);
  }
  isFullAccessForDocs(change: any) {
    this.isFullAccessForDoc.next(change);
  }
  clearFilterAfterSearched(change: any) {
    this.clearFilterAfterSearch.next(change);
  }
  clearFolderSelections(change: any) {
    this.clearFolderSelection.next(change);
  }
  setCartSelections(change: any) {
    this.setCartSelection.next(change);
  }
  removeExistingAttachements(change: any) {
    this.removeExistingAttachement.next(change);
  }
  removeDrafts(change: any) {
    this.removeDraft.next(change);
  }



}
