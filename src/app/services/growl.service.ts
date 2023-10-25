import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Message} from 'primeng/api';

@Injectable()
export class GrowlService {
  private growl = new Subject<Message>();
  growl$ = this.growl.asObservable();

  showGrowl(msg: Message) {
    this.growl.next(msg);
  }
}
