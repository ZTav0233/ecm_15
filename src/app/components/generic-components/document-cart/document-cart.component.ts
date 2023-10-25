import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { DocumentService } from '../../../services/document.service';
import { GrowlService } from '../../../services/growl.service';
import { CoreService } from "../../../services/core.service";
import { BrowserEvents } from "../../../services/browser-events.service";

@Component({
  selector: 'app-document-cart',
  templateUrl: './document-cart.html'
})
export class DocumentCartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public cartItems: any[];
  @Input() public isSelectedAll: boolean = false;
  @Input() public canRemoveLastItem = false;
  @Input() public showHeading = true;
  @Input() public isFromDraft = false;
  @Output() onItemSelect = new EventEmitter();
  @Output() onItemRemoved = new EventEmitter();
  @Output() onItemPreview = new EventEmitter();
  @Input() public isItemSelectable = false;
  @Input() public workflowType = 'Default';
  @Input() public componentTitle = 'Document Cart' as any;
  @Output() checkedItems = new EventEmitter();
  public selectedValues: any;
  removeInProgress = false;
  private currentUser: any;
  private subscriptions: any[] = [];
  busy: boolean;
  constructor(private userService: UserService, private documentService: DocumentService,
    private growlService: GrowlService, private coreService: CoreService, private bs: BrowserEvents) {
    this.selectedValues = [];
  }

  ngOnInit() {
    // console.log(this.cartItems)
    this.currentUser = this.userService.getCurrentUser();
    // setTimeout(() => {
    //   this.cartItems.map(document => {
    //     document.isSign = 1;
    //   })
    // }, 500);
    this.bs.setCartSelection.subscribe(val => {
      let existing = [];
      val.map((d, i) => {
        if (!this.documentService.checkedCartItems.includes(d)) {
          existing.push(d);
        }
      });
      this.documentService.checkedCartItems.concat(existing);
      let temp = [];
      setTimeout(() => {
        this.documentService.cartItems.map(d => {
          this.documentService.checkedCartItems.map(p => {
            if (p.id === d.id) {
              temp.push(d);
            }
          });
          this.selectedValues = temp;
          this.checkedItems.emit(this.selectedValues);
        });
      }, 1000);
    });
  }

  public selectAll(isSelectedAll: boolean) {
    if (isSelectedAll) {
      let values = [];
      let isPdfWordFound = false;
      this.cartItems.forEach(cart => {
        if (!isPdfWordFound && (cart.format.indexOf('pdf') !== -1 || cart.format.indexOf('word') !== -1)) {
          cart.isSign = 1;
        }
        isPdfWordFound = true;
        values.push(cart);
      });
      console.log(this.cartItems)
      this.selectedValues = values;
      this.checkedItems.emit(this.selectedValues);
    } else {
      this.cartItems.forEach(cart => {
        cart.isSign = 0;
      });
      console.log(this.cartItems)
      this.selectedValues = [];
      this.checkedItems.emit(this.selectedValues);
    }
  }

  onCheckItems(event: any, item: any) {
    if (event && (item.format.indexOf('pdf') !== -1 || item.format.indexOf('word') !== -1)) {
      let signDocCount = 0;
      this.selectedValues.map(selectedDoc => {
        if (selectedDoc.isSign == 1) {
          signDocCount++;
        }
      });
      if (signDocCount == 0) {
        item.isSign = 1;
      }
    }
    if (!event) {
      item.isSign = 0;
    }
    this.checkedItems.emit(this.selectedValues);
  }

  mOnItemSelect(item) {
    this.onItemSelect.emit(item);
  }

  ngOnChanges(changes: SimpleChanges) { }

  removeFromExistingAttachement(item) {
    this.bs.removeExistingAttachement.emit(item);
  }

  removeFromCart(item) {
    if (this.removeInProgress) {
      return;
    }
    this.removeInProgress = true;
    this.busy = true;
    this.documentService.removeFromCart(this.currentUser.EmpNo, item.id).subscribe((data) => {
      this.busy = false;
      if (data === 'OK') {
        this.growlService.showGrowl({
          severity: 'info',
          summary: 'Success', detail: 'Document Removed From Cart'
        });
        window.parent.postMessage('removeCartSuccess', '*');
      }
      this.onItemRemoved.emit();
      this.refreshCart();
    }, (err) => {
      this.busy = false;
      this.growlService.showGrowl({
        severity: 'error',
        summary: 'Failure', detail: 'Failed To Remove From Cart'
      });
      this.refreshCart();
    });
  }

  refreshCart() {
    this.busy = true;
    this.documentService.getCart(this.currentUser.EmpNo).subscribe(res => {
      this.busy = false;
      this.documentService.refreshCart(res);
      this.removeInProgress = false;
    }, err => {
      this.busy = false;
      this.removeInProgress = false;
    });
  }

  clearSubscriptions() {
    this.subscriptions.map(s => {
      s.unsubscribe();
    });
  }

  showDocPreview(item) {
    this.onItemPreview.emit(item);
  }

  isItemSelected(item) {
    let itemSelected = false;
    this.selectedValues.map(data => {
      if (item.id == data.id) {
        itemSelected = true;
      }
    })
    return itemSelected;
  }

  signIsClicked(item) {
    if (item.isSign == 0) {
      item.isSign = 1;
    } else {
      item.isSign = 0;
    }
    this.checkedItems.emit(this.selectedValues);
  }

  signAttachmentIsClicked(item) {
    if (item.isSign == 0) {
      item.isSign = 1;
    } else {
      item.isSign = 0;
    }
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }
}