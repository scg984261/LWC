public with sharing class AccountHistoryController {
    
    @AuraEnabled(cacheable=true)
    public static List<AccountHistoryWrapper> getAccountHistory(Id accId) {

        List<AccountHistoryWrapper> accountHistoryWrapperList = new List<AccountHistoryWrapper>();

        Map<String,String> LabelMap = new Map<String,String>();

        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
		Schema.SObjectType leadSchema = schemaMap.get('Account');
		Map<String, Schema.SObjectField> fieldMap = leadSchema.getDescribe().fields.getMap();

        // Adds the API name of a field to a map, along with the label of that field.	
		for (String fieldName : fieldMap.keySet()) {
			LabelMap.put(fieldName,fieldMap.get(fieldName).getDescribe().getLabel());
		}

        List<AccountHistory> accountHistoryList = [
            SELECT Id, AccountId, CreatedById, CreatedDate, Field, NewValue, OldValue
            FROM   AccountHistory
            WHERE  AccountId = :accId
            LIMIT  10
        ];

        Set<String> Ids = new Set<String>();

        for(AccountHistory ah : accountHistoryList) {
            Ids.add(ah.CreatedById);
        }

        // Get the names of the Users who made the changes.
        List<User> users = [
            SELECT Id, Name
            FROM   User
            WHERE  Id IN :Ids
        ];

        Map<Id, String> userMap = new Map<Id, String>();

        for(User us : users) {
            userMap.put(us.Id, us.name);
        }

        for(AccountHistory ach : accountHistoryList) {
            if(userMap.containsKey(ach.CreatedById)) {
                Id historyId = ach.Id;
                String name = userMap.get(ach.CreatedById);
                String field = LabelMap.get(ach.field.toLowerCase());
                String oldVal = String.valueOf(ach.oldValue);
                String newVal = String.valueOf(ach.newValue);
                DateTime dt = ach.CreatedDate;

                AccountHistoryWrapper ahw = new AccountHistoryWrapper(
                    historyId, field, oldVal, newVal, name, dt
                );

                accountHistoryWrapperList.add(ahw);
            }
        }

        return accountHistoryWrapperList;
    }

    public class AccountHistoryWrapper {
        @AuraEnabled public Id historyId;
        @AuraEnabled public String field;
        @AuraEnabled public String oldVal;
        @AuraEnabled public String newVal;
        @AuraEnabled public String name;
        @AuraEnabled public DateTime modDate;

        public AccountHistoryWrapper(Id inputId, String field, String oldValue, String newValue, String userName, DateTime editDate) {
            this.historyId = inputId;
            this.field = field;
            this.oldVal = oldValue;
            this.newVal = newValue;
            this.name = userName;
            this.modDate = editDate;
        }
    }
}