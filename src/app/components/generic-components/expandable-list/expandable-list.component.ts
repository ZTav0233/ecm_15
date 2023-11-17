import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
// import { MessageService } from 'primeng/components/common/messageservice';
import { DataService } from '../../../services/data.Service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-expandable-list',
  templateUrl: './expandable-list.component.html',
  providers: [MessageService],
  styleUrls: ['./expandable-list.component.css']
})
export class ExpandableListComponent implements OnInit, AfterViewInit {
  activeState: boolean[] = [true, false, false];
  from: boolean = false;
  rev: boolean = false;
  through: boolean = false;
  to: boolean = false;
  cc: boolean = false;
  maxChars = 500;
  role = '';
  chars = 0;
  dropDownKeysValues= [
    {
      name: "GBP",
      
    },
    {
      name: "USD",
    }
  ]; 

  @Input() public fromItem;
  @Input() public thruItem;
  @Input() public restitemList;
  @Input() public revItemList;
  @Input() public thruItemList;
  @Input() public toItemList;
  @Input() public toItem;
  @Input() public removeListItems;
  firstOne: any;
  secondOne: boolean;
  constructor(private messageService: MessageService,
    private dataService: DataService) {
    this.dataService.eventAnnounced$.subscribe((res) => {
      console.log(res)
      if (res == "from") {
        this.from = true;
        this.rev = false;
        this.through = false;
        this.to = false;
        this.cc = false;
        
       
      }
      else if (res == "thru") {
        this.through = true;
        this.from = false
        this.rev = false;
        this.to = false;
        this.cc = false;
       
     
      }
      else if (res == "rev") {
        this.rev = true;
        this.from = false;
        this.through = false;
        this.to = false;
        this.cc = false;
        
      }

      else if(res == "to"){
        this.to = true;
        this.rev = false;
        this.from = false;
        this.through = false;
        this.cc = false;
      }
    })
    
  }

  ngOnInit() {
    console.log(this.fromItem)
    console.log(this.thruItem)
    if (this.fromItem == "from") {
      this.from = true;
    }
    else if (this.thruItem == "thru") {
      this.through = true;
    }
    else if (this.fromItem == "rev") {
      this.rev = true;
    }
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit")
  }

  toggle(index: number) {
    console.log(index)
    this.activeState[index] = !this.activeState[index];
  }

}
