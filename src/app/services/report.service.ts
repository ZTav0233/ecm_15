import {Injectable} from '@angular/core';
import * as global from '../global.variables';
import 'rxjs';
import {HttpClient} from "@angular/common/http";
import {CoreService} from "./core.service";
import {Observable} from "rxjs";
@Injectable()
export class ReportService {

  constructor(private http: HttpClient, private coreService: CoreService) {
  }

  getSubOrgUnits(orgCode) {
    const url = `${global.base_url}ReportService/getSubOrgUnits?orgcode=${orgCode}&sysdatetime=${this.coreService.getSysTimeStamp()}`;
    return this.http.get(url);
  }

  getOrgWorkitemCount(query) {
    const url = `${global.base_url}ReportService/getOrgWorkitemCount`;
    // return this.http.post(url, query);
    return this.http.get('./assets/data/getOrgWorkitemCount3.json');
  }

  getOrgSentitemCount(query) {
    const url = `${global.base_url}ReportService/getOrgSentitemCount`;
    return this.http.post(url, query);
  }

  exportOrgWorkitemCount(query) {
    const url = `${global.base_url}ReportService/exportOrgWorkitemCount`;
    return this.http.post(url, query, {responseType:"blob"});
  }

  exportOrgSentitemCount(query){
    const url = `${global.base_url}ReportService/exportOrgSentitemCount`;
    return this.http.post(url, query, {responseType:"blob"});
  }

  getOrgDocumentCount(query) {
    const url = `${global.base_url}ReportService/getOrgDocumentCount`;
    // return this.http.post(url, query);
    return this.http.get('./assets/data/getOrgDocumentCount3.json');
  }

  exportOrgDocumentCount(query) {
    const url = `${global.base_url}ReportService/exportOrgDocumentCount`;
    return this.http.post(url, query,{responseType:"blob"});
  }

  getOrgESignItems(query) {
    const url = `${global.base_url}ReportService/getOrgESignItems`;
    // return this.http.post(url, query);
    return this.http.get('./assets/data/getOrgESignItems3.json');
  }

  getOrgMemoItems(query) {
    const url = `${global.base_url}ReportService/getOrgMemoItems`;
    // return this.http.post(url, query);
    return this.http.get('./assets/data/getOrgMemoItems3.json')
  }

  exportOrgESignItems(query) {
    const url = `${global.base_url}ReportService/exportOrgESignItems`;
    return this.http.post(url, query,{responseType:"blob"});
  }

  exportOrgMemoItems(query) {
    const url = `${global.base_url}ReportService/exportOrgMemoItems`;
    return this.http.post(url, query,{responseType:"blob"});
  }

  getOrgAllReportCount(query){
    const url = `${global.base_url}ReportService/getOrgAllReportCount`;
    // return this.http.post(url, query);
    return this.http.get('./assets/data/getOrgAllReportCount_User3.json');
  }

  public getAllReportStaticData(): Observable<any> {
    return this.http.get('./assets/data/allReportData.json');
  }

  exportOrgAllReportCount(query){
    const url = `${global.base_url}ReportService/exportOrgAllReportCount`;
    return this.http.post(url, query,{responseType:"blob"});
  }

  getRandomMaterialColor(index) {
    return this.materialColor(index);
  }

  materialColor(index) {
   // colors from https://github.com/egoist/color-lib/blob/master/color.json
    const colors = {
      "red": {
        "100": "#ffcdd2",
        "300": "#e57373",
        "700": "#d32f2f",
        "a400": "#ff1744",
      },
      "pink": {
        "100": "#f8bbd0",
        "300": "#f06292",
        "a200": "#ff4081",
      },
      "purple": {
        "100": "#e1bee7",
        "a200": "#e040fb",
      },
      "deepPurple": {
        "100": "#d1c4e9",
        "400": "#7e57c2",
        "a700": "#6200ea"
      },
      "indigo": {
        "200": "#9fa8da",
      },
      "blue": {
        "100": "#bbdefb",
        "600": "#1e88e5",
      },
      "lightBlue": {
        "100": "#b3e5fc",
        "700": "#0288d1",
        "900": "#01579b",
      },
      "cyan": {
        "800": "#00838f",
        "a100": "#84ffff",
      },
      "teal": {
        "200": "#80cbc4"
      },
      "green": {
        "200": "#a5d6a7",
      },
      "lightGreen": {
        "a700": "#64dd17"
      },
      "lime": {
        "100": "#f0f4c3",
        "hex": "#cddc39",
      },
      "yellow": {
        "100": "#fff9c4",
        "a400": "#ffea00",
      },
      "amber": {
        "a100": "#ffe57f",
      },
      "orange": {
        "200": "#ffcc80",
        "a700": "#ff6d00"
      },
      "deepOrange": {
        "a100": "#ff9e80"
      },
      "brown": {
        "100": "#d7ccc8",
      },
      "grey": {
        "600": "#757575",
      },
      "blueGrey": {
        "300": "#90a4ae",
      }
    };
    // pick random property
    // var property = pickRandomProperty(colors);
    const colorList = colors[this.pickRandomProperty(colors)];
    const newColorKey = this.pickRandomProperty(colorList);
    const newColor = colorList[newColorKey];
    //return newColor;
    var colorsPalettes = [
      "#787878", "#aa6130", "#437495", "#82b65f", "#5c83c9", "#f9c320",
      "#acacac", "#e98949", "#6ba2d3",
      "#a5d8dd", "#ea6a47", "#0091d5", "#c0c0c0", "#7e909a", "#b3c100",
      "#6ab187", "#d32d41", "#4cb5f5", "#ced2cc", "#ac3e31", "#dbae58",
      "#488a99", "#b39430", "#7fbfe5", "#51a09e", "#eca496", "#8bc0bf",
      "#efc635", "#e28d2b", "#e27560", "#f7e39a", "#f1c696", "#d9482b"];
    return colorsPalettes[index]?colorsPalettes[index]:newColor;
  }

  randomColor() {
    return "#" + // start with a leading hash
      Math.random() // generates random number
        .toString(16) // changes that number to base 16 as a string
        .substr(2, 6); // gets 6 characters and excludes the leading "0."
  }

  pickRandomProperty(obj) {
    let result;
    let count = 0;
    for(const prop in obj){ //for(const prop in obj){
      if(Math.random() < 1 / ++count){
        result = prop;
      }
    }
    return result;
  }


}
