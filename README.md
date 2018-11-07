# recurring-transaction.bckend-test
This is project was built to test the functionality for the back-end of a recurring transaction system.

## Structure:

App.js - Top Level for the Node.js back-end structure

functions/mongoFunction.js - Location for all of the main transactional functions

## App.js

Routes:

/: GET = very basic helper homepage

/: POST = This is the main enrty point for inserting and processing new transactions

/getRecurringlist: GET =  This page/route returns the raw list of the Recurring List Collection

/getTransferlist:  GET = This page/route returns the raw list of the Transfer List Collection

/removeAllRecords: GET =   This page/route clears all tables and returns a basic confrimation message

## mongoFunction.js

Main Functions:

addRecord: ADDS AND PROCESSES THE NEW INCOMING TRANSACTIONS

getRecurringListRecords: RETURNS THE RECURRING LIST

getTransfelListRecords: RETURNS THE TRANSFER LIST

removeAllDocuments: DELETE ALL RECORDS FROM TRANSFER LIST & RECURRING LIST

#
Author: Stevie Magaco

