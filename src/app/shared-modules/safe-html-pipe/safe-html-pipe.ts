import {NgModule, Pipe} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {SafeHtmlPipe} from '../../pipes/safe-html-pipe';
import {TruncatePipe} from "../../pipes/truncate.pipe";

@NgModule({
  declarations: [
    SafeHtmlPipe,
    TruncatePipe
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [],
  exports: [SafeHtmlPipe,TruncatePipe]
})
export class SharedHTMLPipeModule {

}
