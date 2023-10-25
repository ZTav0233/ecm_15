import {Pipe,PipeTransform} from "@angular/core";

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform{
  transform(value: string, args: number): any {
    if(value){
      let limit = args > 15 ? args : 15;
      let trail =  '...';
      return value.length > limit ? value.substring(0, limit) + trail : value;
    }
  }
}

// export class TruncatePipe implements PipeTransform {
//   transform(value: string, limit = 25, completeWords = false, ellipsis = '...') {
//     if (completeWords) {
//       limit = value.substr(0, 13).lastIndexOf(' ');
//     }
//     return `${value.substr(0, limit)}${ellipsis}`;
//   }
// }
