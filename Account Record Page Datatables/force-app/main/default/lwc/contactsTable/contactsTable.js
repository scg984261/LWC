import { LightningElement, api, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getContacts     from '@salesforce/apex/ContactDatatableController.getContacts';
import deleteContact   from '@salesforce/apex/ContactDatatableController.deleteContact';

const actions = [
    { label: 'Go to Contact', name: 'show_details' },
    { label: 'Delete', name:'delete' },
    { label: 'Edit', name: 'edit'}
];

const COLUMNS = [ 
    {label:"First Name",    fieldName:"FirstName"},
    {label:"Last Name",     fieldName:"LastName"},
    {label:"Title",         fieldName:"Title",       type:"text"},
    {label:"Email",         fieldName:"Email",       type:"email"},
    {label:"Phone",         fieldName:"Phone",       type:"phone", iconName: "utility:call"},
    {label:"Date of Birth", fieldName:"Birthdate",   type:"date"},
    {label:"Created Date",  fieldName:"CreatedDate", type:"date"},   
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    }
];

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 300;

export default class ContactsTable extends NavigationMixin(LightningElement)  {
    @api recordId;

    @track isLoaded = true;

    @track columns = COLUMNS;

    @track searchValue = '';

    @track noRecordsReturned = false;

    @track contacts;

    @track wiredContactsResult;
    
    error;

    @wire(getContacts, {searchKey: '$searchValue', inputId: '$recordId' } )
    wiredContacts(result) {
        console.log(result);
        this.wiredContactsResult = result;  
        if(result.data) {       
            this.contacts = result.data;

            if(this.contacts.length === 0) {
                this.noRecordsReturned = true;
            } else {
                this.noRecordsReturned = false;
            }
        } else if(result.error) {
            this.error = result.error;
            console.log(result.error);
        }
    }
    
    async handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch(actionName) {
            case 'delete': 
                this.isLoaded = false;
                const fn = row.FirstName;
                const ln = row.LastName;
                await deleteContact({ contactId: row.Id });
                await refreshApex(this.wiredContactsResult);
                this.isLoaded = true;
                const toastEvent = new ShowToastEvent({
                    title:   "Contact: " + fn + ' ' + ln + ' successfully deleted',
                    variant: "success",
                    message: "You can recover this record from the recycling bin"
                });
                this.dispatchEvent(toastEvent);
                break;

            case 'show_details':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Contact',
                        actionName: 'view'
                    }
                });
                break;
                
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Contact',
                        actionName: 'edit'
                    }
                });
                break;
            default:
        }
    }

    async handleChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.searchValue = searchKey;
        }, DELAY);

    }
}