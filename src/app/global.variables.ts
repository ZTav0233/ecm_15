'use strict';
// export let base_url = 'http://mvcsecmtesticn:9082/ecmfnapp/resources/';
export let base_url = 'http://ecmdemo1:9080/ECMService/resources/'
// export let base_url = 'http://169.254.144.3:9080/ECMService/resources/'
export let report_url = 'http://ecmdemo1:9080/ECMService/resources/';
export let sectool_url = 'http://ecmdemo1:9080/ECMService/resources/';
export let integration_url = 'http://mvcsecmtesticn:9082/';
export let entry_app_url = 'https://ecmcap.kockw.com/ECMEntry/ECMEntry.application';
export let winxt_url = 'http://ecmdemo1:9080/navigator/bookmark.jsp?desktop=ECM&repositoryId=ECM';
export let esign_url = 'http://mvcsecmtesticn:9080/icnesign/';
export let no_doc_found = 'No Documents Found';
export let no_workitem_found = 'No Items Found';
export let no_news = 'No News Found';
export let no_del = 'No Delegated Users Found';
export let username = 'fatima';
export let integ_prop = ['Id', 'Date Created'];
export let fold = "Top Management";
export let et_lookup = "HR PERSONAL ADMIN EMPLOYEE FILE";
export let et_folder = "HR PERSONAL ADMIN EMPLOYEE FILE:{B47C7B49-BD07-459E-893E-746D8E57189A}@RECRUITMENT COMPLAINTS:{4F2CD70D-57EE-48D7-ACFE-DBAA05D2806B}";
export let et_default_date = "BANK BOND";
export let et_default_orgcode = "RECRUITMENT COMPLAINTS:AT41,OTS NK Document:NP21,OTS NK Drawing:NP21";
export let esign_complete = 'http://mvcsecmtesticn:9082/icnesign/eSignatureComplete';
export let excep_class_names=["ap contracts payments","fuel requisition","isg i and c tpi","isg transport trip tickets"];
export let date_disable_action = '01/01/2005';
export let search_page_size = 50;
export let stop_word_message = {message:"The entered text is a stop word, please enter more words or change it"};
export let et_dependent_lookup = "Test ET Dependent ChoiceList:ReferenceNo:DocType";
export let et_adv_search = ["search all documents", "correspondence"];
export let sign_xPos = '285';
export let sign_yPos = '15';
export let times = [
    { id: 1, label: '12:00 AM', value: { id: 1, time: '12:00 AM' }, disabled: false },
    { id: 2, label: '12:15 AM', value: { id: 2, time: '12:15 AM' }, disabled: false },
    { id: 3, label: '12:30 AM', value: { id: 3, time: '12:30 AM' }, disabled: false },
    { id: 4, label: '12:45 AM', value: { id: 4, time: '12:45 AM' }, disabled: false },
    { id: 5, label: '01:00 AM', value: { id: 5, time: '01:00 AM' }, disabled: false },
    { id: 6, label: '01:15 AM', value: { id: 6, time: '01:15 AM' }, disabled: false },
    { id: 7, label: '01:30 AM', value: { id: 7, time: '01:30 AM' }, disabled: false },
    { id: 8, label: '01:45 AM', value: { id: 8, time: '01:45 AM' }, disabled: false },
    { id: 9, label: '02:00 AM', value: { id: 9, time: '02:00 AM' }, disabled: false },
    { id: 10, label: '02:15 AM', value: { id: 10, time: '02:15 AM' }, disabled: false },
    { id: 12, label: '02:30 AM', value: { id: 12, time: '02:30 AM' }, disabled: false },
    { id: 13, label: '02:45 AM', value: { id: 13, time: '03:45 AM' }, disabled: false },
    { id: 14, label: '03:00 AM', value: { id: 14, time: '03:00 AM' }, disabled: false },
    { id: 15, label: '03:15 AM', value: { id: 15, time: '03:15 AM' }, disabled: false },
    { id: 16, label: '03:30 AM', value: { id: 16, time: '03:30 AM' }, disabled: false },
    { id: 17, label: '03:45 AM', value: { id: 17, time: '03:45 AM' }, disabled: false },
    { id: 18, label: '04:00 AM', value: { id: 18, time: '04:00 AM' }, disabled: false },
    { id: 19, label: '04:15 AM', value: { id: 19, time: '04:15 AM' }, disabled: false },
    { id: 20, label: '04:30 AM', value: { id: 20, time: '04:30 AM' }, disabled: false },
    { id: 21, label: '04:45 AM', value: { id: 21, time: '04:45 AM' }, disabled: false },
    { id: 22, label: '05:00 AM', value: { id: 22, time: '05:00 AM' }, disabled: false },
    { id: 23, label: '05:15 AM', value: { id: 23, time: '05:15 AM' }, disabled: false },
    { id: 24, label: '05:30 AM', value: { id: 24, time: '05:30 AM' }, disabled: false },
    { id: 25, label: '05:45 AM', value: { id: 25, time: '05:45 AM' }, disabled: false },
    { id: 26, label: '06:00 AM', value: { id: 26, time: '06:00 AM' }, disabled: false },
    { id: 27, label: '06:15 AM', value: { id: 27, time: '06:15 AM' }, disabled: false },
    { id: 28, label: '06:30 AM', value: { id: 28, time: '06:30 AM' }, disabled: false },
    { id: 29, label: '06:45 AM', value: { id: 29, time: '06:45 AM' }, disabled: false },
    { id: 30, label: '07:00 AM', value: { id: 30, time: '07:00 AM' }, disabled: false },
    { id: 31, label: '07:15 AM', value: { id: 31, time: '07:15 AM' }, disabled: false },
    { id: 32, label: '07:30 AM', value: { id: 32, time: '07:30 AM' }, disabled: false },
    { id: 33, label: '07:45 AM', value: { id: 33, time: '07:45 AM' }, disabled: false },
    { id: 34, label: '08:00 AM', value: { id: 34, time: '08:00 AM' }, disabled: false },
    { id: 35, label: '08:15 AM', value: { id: 35, time: '08:15 AM' }, disabled: false },
    { id: 36, label: '08:30 AM', value: { id: 36, time: '08:30 AM' }, disabled: false },
    { id: 37, label: '08:45 AM', value: { id: 37, time: '08:45 AM' }, disabled: false },
    { id: 38, label: '09:00 AM', value: { id: 38, time: '09:00 AM' }, disabled: false },
    { id: 39, label: '09:15 AM', value: { id: 39, time: '09:15 AM' }, disabled: false },
    { id: 40, label: '09:30 AM', value: { id: 40, time: '09:30 AM' }, disabled: false },
    { id: 41, label: '09:45 AM', value: { id: 41, time: '09:45 AM' }, disabled: false },
    { id: 42, label: '10:00 AM', value: { id: 42, time: '10:00 AM' }, disabled: false },
    { id: 43, label: '10:15 AM', value: { id: 43, time: '10:15 AM' }, disabled: false },
    { id: 44, label: '10:30 AM', value: { id: 44, time: '10:30 AM' }, disabled: false },
    { id: 45, label: '10:45 AM', value: { id: 45, time: '10:45 AM' }, disabled: false },
    { id: 46, label: '11:00 AM', value: { id: 46, time: '11:00 AM' }, disabled: false },
    { id: 47, label: '11:15 AM', value: { id: 47, time: '11:15 AM' }, disabled: false },
    { id: 48, label: '11:30 AM', value: { id: 48, time: '11:30 AM' }, disabled: false },
    { id: 49, label: '11:45 AM', value: { id: 49, time: '11:45 AM' }, disabled: false },
    { id: 50, label: '12:00 PM', value: { id: 50, time: '12:00 PM' }, disabled: false },
    { id: 51, label: '12:15 PM', value: { id: 51, time: '12:15 PM' }, disabled: false },
    { id: 52, label: '12:30 PM', value: { id: 52, time: '12:30 PM' }, disabled: false },
    { id: 53, label: '12:45 PM', value: { id: 53, time: '12:45 PM' }, disabled: false },
    { id: 54, label: '01:00 PM', value: { id: 54, time: '01:00 PM' }, disabled: false },
    { id: 55, label: '01:15 PM', value: { id: 55, time: '01:15 PM' }, disabled: false },
    { id: 56, label: '01:30 PM', value: { id: 56, time: '01:30 PM' }, disabled: false },
    { id: 57, label: '01:45 PM', value: { id: 57, time: '01:45 PM' }, disabled: false },
    { id: 58, label: '02:00 PM', value: { id: 58, time: '02:00 PM' }, disabled: false },
    { id: 59, label: '02:15 PM', value: { id: 59, time: '02:15 PM' }, disabled: false },
    { id: 60, label: '02:30 PM', value: { id: 60, time: '02:30 PM' }, disabled: false },
    { id: 61, label: '02:45 PM', value: { id: 61, time: '02:45 PM' }, disabled: false },
    { id: 62, label: '03:00 PM', value: { id: 62, time: '03:00 PM' }, disabled: false },
    { id: 63, label: '03:15 PM', value: { id: 63, time: '03:15 PM' }, disabled: false },
    { id: 64, label: '03:30 PM', value: { id: 64, time: '03:30 PM' }, disabled: false },
    { id: 65, label: '03:45 PM', value: { id: 65, time: '03:45 PM' }, disabled: false },
    { id: 66, label: '04:00 PM', value: { id: 66, time: '04:00 PM' }, disabled: false },
    { id: 67, label: '04:15 PM', value: { id: 67, time: '04:15 PM' }, disabled: false },
    { id: 68, label: '04:30 PM', value: { id: 68, time: '04:30 PM' }, disabled: false },
    { id: 69, label: '04:45 PM', value: { id: 69, time: '04:45 PM' }, disabled: false },
    { id: 70, label: '05:00 PM', value: { id: 70, time: '05:00 PM' }, disabled: false },
    { id: 71, label: '05:15 PM', value: { id: 71, time: '05:15 PM' }, disabled: false },
    { id: 72, label: '05:30 PM', value: { id: 72, time: '05:30 PM' }, disabled: false },
    { id: 73, label: '05:45 PM', value: { id: 73, time: '05:45 PM' }, disabled: false },
    { id: 74, label: '06:00 PM', value: { id: 74, time: '06:00 PM' }, disabled: false },
    { id: 75, label: '06:15 PM', value: { id: 75, time: '06:15 PM' }, disabled: false },
    { id: 76, label: '06:30 PM', value: { id: 76, time: '06:30 PM' }, disabled: false },
    { id: 77, label: '06:45 PM', value: { id: 77, time: '06:45 PM' }, disabled: false },
    { id: 78, label: '07:00 PM', value: { id: 78, time: '07:00 PM' }, disabled: false },
    { id: 79, label: '07:15 PM', value: { id: 79, time: '07:15 PM' }, disabled: false },
    { id: 80, label: '07:30 PM', value: { id: 80, time: '07:30 PM' }, disabled: false },
    { id: 81, label: '07:45 PM', value: { id: 81, time: '07:45 PM' }, disabled: false },
    { id: 82, label: '08:00 PM', value: { id: 82, time: '08:00 PM' }, disabled: false },
    { id: 83, label: '08:15 PM', value: { id: 83, time: '08:15 PM' }, disabled: false },
    { id: 84, label: '08:30 PM', value: { id: 84, time: '08:30 PM' }, disabled: false },
    { id: 85, label: '08:45 PM', value: { id: 85, time: '08:45 PM' }, disabled: false },
    { id: 86, label: '09:00 PM', value: { id: 86, time: '09:00 PM' }, disabled: false },
    { id: 87, label: '09:15 PM', value: { id: 87, time: '09:15 PM' }, disabled: false },
    { id: 88, label: '09:30 PM', value: { id: 88, time: '09:30 PM' }, disabled: false },
    { id: 89, label: '09:45 PM', value: { id: 89, time: '09:45 PM' }, disabled: false },
    { id: 90, label: '10:00 PM', value: { id: 90, time: '10:00 PM' }, disabled: false },
    { id: 91, label: '10:15 PM', value: { id: 91, time: '10:15 PM' }, disabled: false },
    { id: 92, label: '10:30 PM', value: { id: 92, time: '10:30 PM' }, disabled: false },
    { id: 93, label: '10:45 PM', value: { id: 93, time: '10:45 PM' }, disabled: false },
    { id: 94, label: '11:00 PM', value: { id: 94, time: '11:00 PM' }, disabled: false },
    { id: 95, label: '11:15 PM', value: { id: 95, time: '11:15 PM' }, disabled: false },
    { id: 96, label: '11:30 PM', value: { id: 96, time: '11:30 PM' }, disabled: false },
    { id: 97, label: '11:45 PM', value: { id: 97, time: '11:45 PM' }, disabled: false },
];

