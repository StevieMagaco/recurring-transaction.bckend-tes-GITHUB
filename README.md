# recurring-transaction.bckend-test
This is project was built to test the functionality for the back-end of a recurring transaction system.

## Run:

1. npm i / npm install

2. node app.js / npm start

## Structure:

App.js - Top Level for the Node.js back-end structure

functions/mongoFunction.js - Location for all of the main transactional functions

## App.js

Routes:

/: GET = This route returns the raw list of the Recurring List Collection

/: POST = This is the main enrty point for inserting and processing new transactions

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

