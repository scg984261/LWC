import { LightningElement, api, wire } from 'lwc';

import getAssociatedAccount        from '@salesforce/apex/AccountDetailsController.getAssociatedAccount';

import ACCOUNT_NAME_FIELD          from '@salesforce/schema/Account.Name';
import ACCOUNT_NUMBER_FIELD        from '@salesforce/schema/Account.AccountNumber';
import ACCOUNT_INDUSTRY_FIELD      from '@salesforce/schema/Account.Industry';
import ACCOUNT_NUMBER_OF_EMPLOYEES from '@salesforce/schema/Account.NumberOfEmployees';
import ACCOUNT_ANNUAL_REVENUE      from '@salesforce/schema/Account.AnnualRevenue';
import ACCOUNT_WEBSITE             from '@salesforce/schema/Account.Website';
import ACCOUNT_PHONE               from '@salesforce/schema/Account.Phone';

export default class AccountDetailsCardApex extends LightningElement {
    account;

    @api recordId;

    @wire(getAssociatedAccount, {contactId: '$recordId'})
    wiredAccount( { data } ) {
        if(data) {
            this.account = data;
        }
    }

    fields = [
        ACCOUNT_NAME_FIELD,
        ACCOUNT_NUMBER_FIELD,
        ACCOUNT_INDUSTRY_FIELD,
        ACCOUNT_NUMBER_OF_EMPLOYEES,
        ACCOUNT_ANNUAL_REVENUE,
        ACCOUNT_WEBSITE,
        ACCOUNT_PHONE
    ];
}