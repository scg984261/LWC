import { LightningElement, api, wire } from 'lwc';

import getAccountHistory from '@salesforce/apex/AccountHistoryController.getAccountHistory';

const COLUMNS = [
    {label:"User", fieldName:"name"},
    {label:"Field", fieldName:"field"},
    {label:"Old Value", fieldName:"oldVal"},
    {label:"New Value", fieldName:"newVal"},
    {label:"Date", fieldName:"modDate", type:'date', typeAttributes: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}}
];

export default class AccountHistoryTable extends LightningElement {
    @api recordId

    accountHistoryData;
    noRecordsReturned = true;

    @wire(getAccountHistory, { accId: '$recordId' } )
    wiredHistory( { data } ) {
        if(data) {
            this.accountHistoryData = data;

            if(data.length > 0) {
                this.noRecordsReturned = false;
            }
        }
    }
    columns=COLUMNS;
}