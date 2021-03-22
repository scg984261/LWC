/**
 * Apex class which contains simple methods for querying Contact records based on a parent AccountId
 * Also contains a method for deleting a Contact in a simple DML operation.
 * 
 * Author: Scott Gillen (scottg159@gmail.com), Git: scg984261
 * Last modified date: 22-Mar-2021
 */
public with sharing class ContactDatatableController {

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(String searchKey, Id inputId) {
        String key = '%' + searchKey + '%';

        List<Contact> contacts = new List<contact>();

        if(key == '%%') {
            contacts = [
                SELECT  Id, FirstName, LastName, AccountId, Account.Name, Title, Phone, Email, Birthdate, CreatedById, OwnerId, CreatedDate 
                FROM    Contact 
                WHERE   AccountId=:inputId
                ORDER BY LastName ASC 
            ];
        } else {          
            contacts = [
                SELECT Id, FirstName, LastName, AccountId, Account.Name, Title, Phone, Email, Birthdate, CreatedById, OwnerId, CreatedDate
                FROM   Contact
                WHERE (FirstName LIKE :key
                OR     LastName LIKE :key)
                AND    AccountId=:inputId
                LIMIT  10
            ];
        }

        return contacts;
    }

    @AuraEnabled
    public static void deleteContact(Id contactId) {
        Contact contactToBeDeleted = [
            SELECT Id
            FROM Contact
            WHERE Id = :contactId
            LIMIT 1
        ];
        
        DELETE contactToBeDeleted;
    }
}