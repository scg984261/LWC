import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

import ACCOUNT_FIELD from '@salesforce/schema/Contact.AccountId';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNT_NUMBER_FIELD from '@salesforce/schema/Account.AccountNumber';
import ACCOUNT_INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import ACCOUNT_NUM_OF_EMPLOYEES_FIELD from '@salesforce/schema/Account.NumberOfEmployees';
import ACCOUNT_ANNUAL_REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';

const fields = [ACCOUNT_FIELD];

export default class AccountDetailsCardLWC extends LightningElement {

    @api recordId;
    @track contact;
    @track accountId;
    @track accountFields = [
        ACCOUNT_NAME_FIELD,
        ACCOUNT_NUMBER_FIELD,
        ACCOUNT_INDUSTRY_FIELD,
        ACCOUNT_NUM_OF_EMPLOYEES_FIELD,
        ACCOUNT_ANNUAL_REVENUE_FIELD
    ];

    @wire (getRecord, { recordId: '$recordId', fields } )
    wiredAccount(value) {
        if (value.data) {
            this.contact = value.data;
            this.accountId = this.contact.fields.AccountId.value;
        }
    }
}