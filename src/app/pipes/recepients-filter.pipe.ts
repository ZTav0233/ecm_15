import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'filterToPipe'})
export class FilterToPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value) {
      return value.filter(v => v.actionType === 'to' || v.actionType === 'TO' || v.actionType === 'Reply-TO');
    } else {
      return value;
    }
  }

}

@Pipe({name: 'filterCCPipe'})
export class FilterCCPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value) {
      return value.filter(v => v.actionType === 'cc' || v.actionType === 'CC' || v.actionType === 'Reply-CC');
    } else {
      return value;
    }
  }

}
