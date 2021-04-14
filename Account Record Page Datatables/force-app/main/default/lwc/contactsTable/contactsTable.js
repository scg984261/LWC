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
    {label:"First Name",    fieldName:"FirstName", sortable: true},
    {label:"Last Name",     fieldName:"LastName", sortable: true},
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

    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

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
        }
    }

    // Used to sort the 'Age' column
    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                  return primer(x[field]);
              }
            : function(x) {
                  return x[field];
              };

        return function(a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.contacts.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.contacts.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
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
                    variant: "success"
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

    setRecordsReturned() {
        if(this.contacts.data.length === 0) {
            this.noRecordsReturned = true;
        } else {
            this.noRecordsReturned = false;
        }

        console.log(this.noRecordsReturned);
        console.log(this.contacts);
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