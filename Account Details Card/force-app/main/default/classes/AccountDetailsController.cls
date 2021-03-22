public with sharing class AccountDetailsController {

    @AuraEnabled(cacheable=true)
    public static Account getAssociatedAccount(Id contactId) {

        // Get Contact Record First
        Contact contact = [
            SELECT Id, AccountId
            FROM   Contact
            WHERE  Id = :contactId
            LIMIT  1
        ];

        // Then get the Account associated with that client.
        Account account = [
            SELECT Id, Name, AccountNumber, Industry, NumberOfEmployees, AnnualRevenue, Website, Phone 
            FROM   Account
            WHERE  Id = :contact.AccountId
            LIMIT  1
        ];

        return account;
    }
}