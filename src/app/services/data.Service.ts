import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService implements OnDestroy {
    private eventTabChange = new Subject<any>();
    private refreshUISource = new Subject<any>();
    private eventAnnouncedSource = new Subject<any>();
    private eventMemoTypeSource = new Subject<any>();

    eventAnnounced$ = this.eventAnnouncedSource.asObservable();
    memoTypeState$ = this.eventMemoTypeSource.asObservable();
    refreshAnnounced$ = this.refreshUISource.asObservable();
    eventTabChanged$ = this.eventTabChange.asObservable();
    
    announceEvent(event: any):void {
        this.eventAnnouncedSource.next(event);
    }
    setDefaultMemoType(event:any){
        console.log(event)
        this.eventMemoTypeSource.next(event)
    }
    refreshUI(event: any):void {
        this.refreshUISource.next(event);
        console.log(this.refreshUISource)
    }
    tabChangeEvent(event:any):void{
        this.eventTabChange.next(event)
    }

    ngOnDestroy(): void {
        this.eventAnnouncedSource.unsubscribe();
        this.refreshUISource.unsubscribe();
        this.eventTabChange.unsubscribe();
        this.eventMemoTypeSource.unsubscribe();
    }
}