import {Injectable} from '@angular/core';
import {Output, EventEmitter} from '@angular/core';
import {User} from '../models/user/user.model';
import * as global from '../global.variables';
import 'rxjs';
import {HttpClient} from "@angular/common/http";
import {CoreService} from "./core.service";
import * as polyfill from '../../assets/js/Resources/polyfill.js';
declare var ie11_polyfill: any;

@Injectable()
export class NewsService {
  private base_url: string;
  private user: User;

  constructor(private http: HttpClient, private coreService: CoreService){
  }

  getNews(userLogin):any{
    const url = `${global.base_url}NewsService/getNews?userid=${userLogin}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  saveNews(newsArray):any{
    const url = `${global.base_url}NewsService/saveNews?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.post(url, newsArray,{responseType:'text'});
  }

  getAllNews() {
    const url = `${global.base_url}NewsService/getAllNews?sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }
  removeNews(id) {
    const url = `${global.base_url}NewsService/removeNews?id=${id}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url,{responseType:'text'});
  }
}
