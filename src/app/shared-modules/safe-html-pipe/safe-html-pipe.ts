import {NgModule, Pipe} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {SafeHtmlPipe} from '../../pipes/safe-html-pipe';
import {TruncatePipe} from "../../pipes/truncate.pipe";
import {ArrayFixPipe} from "../../pipes/arrayfix-pipe";

@NgModule({
  declarations: [
    SafeHtmlPipe,
    TruncatePipe,
    ArrayFixPipe
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [],
  exports: [SafeHtmlPipe,TruncatePipe,ArrayFixPipe]
})
export class SharedHTMLPipeModule {

}
