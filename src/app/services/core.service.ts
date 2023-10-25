import {Injectable} from '@angular/core';
// import * as json2xls from 'json2xls';
// import {saveAs} from 'file-saver';
// import 'rxjs/Rx';
import * as moment from 'moment';
import * as _ from 'lodash';
@Injectable()
export class CoreService {
  public progress: any = {};
  public progress2: any = {};
  isAdvanced = 'N';
  public displayProgress = false;
  public searchClickCount = 0;
  public isMemoryTimeout = false;
  constructor() {
    // const source = Observable.of(1).subscribe();
    this.progress = {busy: true, message: '', backdrop: true};
  }

  //--------22/05/2018 02:03 PM-------------
  // convertToTimeInbox(date){
  //   const d=/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)\s+(.+)/.exec(date);
  //   const d2=[];
  //   let val=null;
  //   if(d && d!==null){
  //     for(let i=1;i<6;i++){
  //       d2[i]=parseInt(d[i],null);
  //     }
  //     if(d[6].toLowerCase()==='pm' && d2[4]<12){
  //     d2[4]=d2[4]+12;
  //   }else if(d[6].toLowerCase()==='am' && d2[4]===12){
  //       d2[4]=0;
  //     }

  //     val=new Date(d2[3],(d2[2]-1),d2[1],d2[4],d2[5],0).getTime();
  //   }

  //   return val;

  // }

  //--------26/09/2018 12:15:54.000------------------
  // convertToTimeErrorLogs(date) {
  //   const d = /(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+):(\d+).(\d+)/.exec(date);
  //   const d2 = [];
  //   let val = null;
  //   if (d && d !== null) {
  //     for (let i = 1; i < 7; i++) {
  //       d2[i] = parseInt(d[i], null);
  //     }
  //     val = new Date(d2[3], (d2[2] - 1), d2[1], d2[4], d2[5], d2[6]).getTime();
  //   }
  //   return val;
  // }

  //--------26/09/2018 12:15:54------------------
  // convertToTimeFolder(date){
  //   const d=/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+):(\d+)/.exec(date);
  //   const d2=[];
  //   let val=null;
  //   if(d && d!==null){
  //     for(let i=1;i<7;i++){
  //       d2[i]=parseInt(d[i],null);
  //     }

  //     val=new Date(d2[3],(d2[2]-1),d2[1],d2[4],d2[5],d2[6]).getTime();
  //   }

  //   return val;

  // }

  // formatDate(date) {
  //   const d = new Date(date);
  //   let str = '';
  //   if (d.getDate() < 10) {
  //     str = str + '0' + d.getDate();
  //   } else {
  //     str = str + d.getDate();
  //   }
  //   if (d.getMonth() < 9) {
  //     str = str + '0' + (d.getMonth() + 1)
  //   } else {
  //     str = str + (d.getMonth() + 1)
  //   }
  //   str = str + d.getFullYear() + 'T000000Z';
  //   return str;
  // }
  formatDateForSearch(date) {
    const d = new Date(date);
    let str = '';
    if (d.getMonth() < 9) {
      str = str + '0' + (d.getMonth() + 1)
    } else {
      str = str + (d.getMonth() + 1)
    }
    if (d.getDate() < 10) {
      str = str + '0' + d.getDate();
    } else {
      str = str + d.getDate();
    }
    str = d.getFullYear() + str + 'T210000Z';
    return str;
  }

  // formatDateForDelegate(date) {
  //   const d = new Date(date);
  //   let str = '';
  //   if (d.getDate() < 10) {
  //     str = str + '0' + d.getDate();
  //   } else {
  //     str = str + d.getDate();
  //   }
  //   if (d.getMonth() < 9) {
  //     str = '0' + (d.getMonth() + 1) + "-" + str
  //   } else {
  //     str = (d.getMonth() + 1) + "-" + str
  //   }
  //   str = d.getFullYear() + "-" + str;
  //   return str;
  // }
   formatDateForDelegateDDMMYY(date) {
     var initial = date.split(/\//);
     let str ='';
      str=( [ initial[2],initial[1], initial[0],  ].join('-')); //=> 'yy/mm/dd'
     return str;
  }
  formatDateForDelegateFormat(date) {
    var initial = date.split(/\//);
    let str ='';
    str=( [ initial[0],initial[1], initial[2],  ].join('-')); //=> 'dd/mm/yyyy'
    return str;
  }
  formatDateForDelegateFormatMMDDReverse(date) {
    var datearray = date.split("-");

    var newdate = datearray[1] + '-' + datearray[0] + '-' + datearray[2];
    return newdate;
  }

  // formatDateForFinishBefore(date) {
  //   const d = new Date(date);
  //   let str = '';
  //   if (d.getDate() < 10) {
  //     str = str + '0' + d.getDate();
  //   } else {
  //     str = str + d.getDate();
  //   }
  //   if (d.getMonth() < 9) {
  //     str = str + "/" + '0' + (d.getMonth() + 1)
  //   } else {
  //     str = str + "/" + (d.getMonth() + 1)
  //   }
  //   str = str + "/" + d.getFullYear();
  //   return str;
  // }

  // formatDateForLaunch(date) {
  //   const d = new Date(date);
  //   let str = '';
  //   let suffix = 'AM';
  //   if (d.getHours() >= 12) {
  //     suffix = 'PM';
  //   }
  //   if (d.getDate() < 10) {
  //     str = str + '0' + d.getDate();
  //   } else {
  //     str = str + d.getDate();
  //   }
  //   if (d.getMonth() < 9) {
  //     str = str + '-0' + (d.getMonth() + 1)
  //   } else {
  //     str = str + '-' + (d.getMonth() + 1)
  //   }
  //   str = str + '-' + d.getFullYear() + ' ';

  //   if (d.getHours() < 10) {
  //     str = str + '0' + d.getHours();
  //   }
  //   else if (d.getHours() > 12 && d.getHours() < 22) {
  //     str = str + '0' + (d.getHours() - 12);
  //   } else if (d.getHours() > 21) {
  //     str = str + (d.getHours() - 12);
  //   } else {
  //     str = str + d.getHours();
  //   }
  //   str = str + ':';
  //   if (d.getMinutes() < 9) {
  //     str = str + '0' + d.getMinutes();
  //   } else {
  //     str = str + d.getMinutes();
  //   }

  //   str = str + ' ' + suffix;

  //   return str;
  // }

  // formatDateForFileName(date) {
  //   const d = new Date(date);
  //   let str = '';
  //   if (d.getDate() < 10) {
  //     str = str + '0' + d.getDate();
  //   } else {
  //     str = str + d.getDate();
  //   }
  //   if (d.getMonth() < 9) {
  //     str = '0' + (d.getMonth() + 1) + str
  //   } else {
  //     str = (d.getMonth() + 1) + str
  //   }
  //   str = d.getFullYear() + str;
  //   return str;
  // }

  exportToExcel(data, fileName, exportFields) {
    // const xls = json2xls(data, {fields: exportFields});
    // const file = new Blob([this.s2ab(xls)], {type: 'application/vnd.ms-excel'});
    // saveAs(file, fileName);
  }

  s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  /**
   * @description Get the row grouping value for grid
   * @param record
   * @param groupField
   */
  getRowGroupText(record, groupField = 'receivedDate2') {
    if (!!record && record.hasOwnProperty(groupField) && record[groupField]) {
      if (groupField === 'createdDate' || groupField === 'receivedDate2'
        || groupField === 'createdOn2' || groupField === 'deadline2' || groupField === 'reminder2' || groupField === 'lastItemSentOn2') {
        return record.dateGroup.indexOf('$') > -1 ? record.dateGroup.substr(2) : record.dateGroup;
      } else {
        return record[groupField];
      }
    }
    return 'Other'
  };

  /**
   * @description Returns the javascript date object for given timestamp
   * @param dateTimeStamp
   */
  getDateObjectFromTimestamp(dateTimeStamp) {
    if (!dateTimeStamp) {
      return null;
    }
    return moment(dateTimeStamp).toDate()
  };

  /**
   * @description Returns the timestamp for the given date
   * @param date
   * @param dateFormat
   * @param separator
   */
  getTimestampFromDate(date, dateFormat, separator) {
    if (!date) {
      return null;
    }
    separator = separator || '-';
    dateFormat = dateFormat || this.dateTimeFormats.DDMMYYYYhhmmA;
    dateFormat = this.changeDateFormatSeparator(dateFormat, separator);
    //console.log(moment(date, dateFormat).valueOf());
    return moment(date, dateFormat).valueOf();
  };

  dateTimeFormats = {
    DDMMYYYY: "DD-MM-YYYY",
    MMDDYYYY: "MM-DD-YYYY",
    YYYYMMDD: "YYYY-MM-DD",
    YYYYDDMM: "YYYY-DD-MM",
    DDMMYYYYhhmmA: "DD-MM-YYYY hh:mm A",
    DDMMYYYYHHmmss_SS: "DD-MM-YYYY HH:mm:ss",
    DDMMYYYYHHmmss_SSS: "DD-MM-YYYY HH:mm:ss.SSS"
  };

  ecmDateTimeFormats = {
    DDMMYYYY: "dd-MM-yyyy",
    MMDDYYYY: "MM-dd-yyyy",
    YYYYMMDD: "yyyy-MM-dd",
    DDMMYYYYhhmmA: "dd-MM-yyyy hh:mm aaa",
    DDMMYYYYHHmmss_SSS: "dd-MM-yyyy HH:mm:ss.SSS"
  };

  /**
   * @description Change the separator of provided date format
   * @param format
   * @param separator
   */
  changeDateFormatSeparator(format, separator) {
    separator = separator || '-';
    return format.replace(new RegExp('-', 'g'), separator)
  }

  /**
   * @description Returns the formatted date using the given date and format
   * @param date
   * @param format
   * @param separator
   */
  getFormattedDateString(date, format, separator = '-') {
    if (!date) {
      return null;
    }
    format = format || this.dateTimeFormats.DDMMYYYY;
    separator = separator || '-';
    let formattedDate = moment(date).format(format);
    return (separator ? formattedDate.replace(new RegExp('-', 'g'), separator) : formattedDate);
  }

  /**
   * @description Get current system datetime timestamp
   */
  getSysTimeStamp() {
    const sysDateTime = new Date();
    return sysDateTime.getTime();
  }

  /**
   * @description Get the priority string by integer value
   * @param priority
   */
  getPriorityString(priority) {
    if (!priority)
      return '';
    if (priority === 1) {
      return 'Low';
    } else if (priority === 2) {
      return 'Normal';
    } else if (priority === 3) {
      return 'High';
    } else {
      return '';
    }
  }

  /**
   * @description Get the type string by integer value
   * @param type
   */
  getTypeString(type) {
    if (type == 1) {
      return 'Role';
    } else if (type == 2) {
      return 'Group';
    } else if (type == 3) {
      return 'Directorate';
    } else {
      return '';
    }
  }

  /**
   * @description Get the sort order text by sort order value
   * @param order
   * can be 1(asc) or -1(desc)
   * @param {boolean} capitalize
   * @returns {string}
   */
  getSortOrderText(order, capitalize = false) {
    if (capitalize)
      return order === 1 ? 'asc'.toUpperCase() : 'desc'.toUpperCase();
    return order === 1 ? 'asc' : 'desc';
  };

  /**
   * @description Get the sort order value by sort order text
   * @param order
   * @returns {number}
   */
  getSortOrderValueFromText(order) {
    return order && order.toLowerCase() === 'asc' ? 1 : -1;
  };


  /**
   * @description Filters the workItems by given global filter search text
   * @param originalRecords
   * @param searchText
   * @param columnsToFilter
   */
  getFilterRecords(originalRecords, searchText, columnsToFilter) {
    if (!searchText) {
      return originalRecords;
    }
    searchText = searchText.toLowerCase();
    let columns = _.cloneDeep(columnsToFilter),
      searchedRecords = [];

    _.map(originalRecords, function (record) {
      for (let i = 0; i < columns.length; i++) {
        if (record[columns[i]] && (record[columns[i]].toLowerCase().indexOf(searchText) > -1)) {
          searchedRecords.push(record);
          break;
        }
      }
    });
    return searchedRecords;
  }

  /**
   * @description Get Date Time for export file name.
   */
  getDateTimeForExport() {
    return this.getFormattedDateString(new Date(), this.dateTimeFormats.DDMMYYYYHHmmss_SSS, '-');
  }

  /*
* @description do continue content search
* @param array of document properties
* @param property name for which value is required
*/
  getPropValue(props, propName) {
    let value;
    props.map((prop) => {
      if (prop.name === propName || (prop.hasOwnProperty('symName') && prop.symName === propName)) {
        value = prop.mvalues[0];
      }
    });
    return value;
  }

  hideProgressDialog() {
    this.displayProgress = false;
  }

  /**
   * Removes all property intercepted to show in the grid and send it back to server for export.
   * @param docFromGrid
   * @constructor
   */
  UnInterceptContentSearchResults(docFromGrid){
    docFromGrid.map((doc, index)=>{
      delete doc.name;
      delete doc.documentDate;
      delete doc.orgcode;
      delete doc.ecmno;
      delete doc.documentDate2;
      delete doc.addOn2;
      if(doc.hasOwnProperty('_$visited'))
        delete doc._$visited;

      if (doc.hasOwnProperty('isDeleted'))
        delete doc.isDeleted;
    });
    return docFromGrid
  }
}
