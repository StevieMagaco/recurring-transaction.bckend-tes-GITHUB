const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const async  = require( 'async' );
 
// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'interview_challenge';

// Getting the difference between two dates
const dayDiff = function(d1, d2)
{
  d1 = d1.getTime() / 86400000;
  d2 = d2.getTime() / 86400000;
  return new Number(d2 - d1).toFixed(0);
}

//PROCESSING NEW INCOMING TRANSACTIONS
const processNewTransfers = function( arr, db ){
    //PROCESSING THROUGH EACH ARR RECORD
    async.eachSeries(arr, function(element, callback) {
        //CHECKING RECURRING LIST COLLECTION FOR EXISTING RECURRING TRANSACTION
        recurringListCheck(db, element, function() {
            //IF TRANSACTION IS FOUND
            if(arguments['0'].length > 0){
                // UPDATING RECURRING LIST RECORD
                updateRecurringListRecord(db, element, function() {
                    // ADDING TRANSACTION TO TRANSACTION LIST
                    addToTransferList(db, element, function() { callback(null); });
                });
            }
            else{
                //IF NO TRANSACTION IS FOUND
                //CHECKING TRANSACTION LIST COLLECTION FOR EXISTING RECURRING TRANSACTION
                treansferListRecurringCheck(db, element, function() {
                    //IF TRANSACTION IS FOUND
                    if(arguments['0'].length > 0){
                        const listRecord = arguments['0'][0];
                        // ADDING NEW RECURRING RECORD FROM T.L. COLLECTION TO R.T. COLLECTION
                        addToReccuringList(db, listRecord, function() {
                            // UPDATING RECURRING LIST RECORD
                            updateRecurringListRecord(db, element, function() {
                                // ADDING TRANSACTION TO TRANSACTION LIST
                                addToTransferList(db, element, function() { callback(null); });
                            });
                        });
                    }
                    else{
                        //IF TRANSACTION IS NOT FOUND
                        // ADDING TRANSACTION TO TRANSACTION LIST
                        addToTransferList(db, element, function() { callback(null); });
                    }
                });
            }
        });
    }, function(err) {
        // if any of the file processing produced an error, err would equal that error
        if( err ) {
          // One of the iterations produced an error.
          // All processing will now stop.
          //console.log('A file failed to process');
          //console.log(err);
        } else {
          ////console.log('All files have been processed successfully');
        }
    });    
}

//ADD NEW INCOMING TRANSACTIONS
const addRecord = function(arr, res){
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        //console.log("Connected successfully to server");
          
        const db = client.db(dbName);

        async.series({
            one: function(callback) {
                setTimeout(function() {
                    //PROCESSING TRANFERS
                    console.log('-- PROCESSING TRANSFERS --');
                    processNewTransfers( arr, db );
                    callback(null, 1);
                }, 300);
            },
            two: function(callback){
                setTimeout(function() {
                    //SENDING RESPONSE
                    console.log('-- SENDING RESPONSE --');
                    getRecurring( db, res );
                    callback(null, 2);
                }, 200);
            },
            three: function(callback){
                setTimeout(function() {
                    //CLOSING MONGO CONNECTION
                    console.log('-- CLOSING MONGODB CONNECTION --');
                    client.close();
                    callback(null, 3);
                }, 100);
            }
        }, function(err, results) {
            // results is now equal to: {one: 1, two: 2}
        });

        
    });
}

//GET RECURRING LIST
const getRecurring = function( db, res ){
    // Get the documents from collection
    const collection = db.collection('recurring_list');
    // Find all documents
    collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    //console.log("Found the following Recurring records");
    //console.log(docs)
    res.send(docs);
    });
}

//CHECKS THE RECURRING LIST COLLECTION
const recurringListCheck = function(db, element, callback) {
    // Get the documents from collection
    const collection = db.collection('recurring_list');
    //console.log("-- RECURRING LIST COLLECTION COMPARED TO --");
    //console.log('NAME: ' + element.name + 'ID: ' + element.user_id);

    // Find specific documents
    collection.find({ $text: { $search: element.name }, user_id: element.user_id }).toArray(function(err, docs) {
      assert.equal(err, null);
      //console.log("-- RECURRING LIST COLLECTION FOUND --");
      //console.log(docs)
      callback(docs);
    });
  }

//CHECKS THE TRANSFER LIST COLLECTION
const treansferListRecurringCheck = function(db, element, callback) {
    // Get the documents from collection
    const collection = db.collection('transaction_list');
    //console.log("-- TRANSFER LIST COLLECTION COMPARED TO --");
    //console.log('NAME: ' + element.name + 'ID: ' + element.user_id);

    // Find specific documents
    collection.find({ $text: { $search: element.name }, user_id: element.user_id, amount: element.amount }).toArray( function(err, docs) {
      assert.equal(err, null);
      //console.log("-- TRANSFER LIST COLLECTION FOUND --");
      //console.log(docs)
      callback(docs);
    });
  }
  
//UPDATES A RECORD IN THE RECURRING LIST COLLECTION 
  const updateRecurringListRecord = function(db, element, callback) {
    // Get the recurring_list collection
    const collection = db.collection('recurring_list');

    // Find recurring list document
    collection.findOne({ name: element.name, user_id: element.user_id }, function(err, doc) {
        assert.equal(err, null);
        if(doc === null)
          return null;
  
        //Calculate next Date
        const curDate = new Date(element.date);
        const storedDate = new Date( doc.transactions[ doc.transactions.length - 1 ].date );
        const diff = dayDiff(storedDate, curDate);
        var nextDate = curDate;
        nextDate.setDate(nextDate.getDate() + parseInt(diff));

        // Update recurring list document
        collection.updateOne(
            { name: element.name, user_id: element.user_id },
            { $push: { transactions: element },
              $set : { next_date: nextDate.toISOString() }}, 
            function(err, docs) {
                assert.equal(err, null);
                if(docs.result.nModified > 1){
                //console.log("Update of Recurring Successful:");
                //console.log(docs);
                callback(docs);
                }
                else{
                    //console.log("No Update Made to Rcurring List");
                    callback();
                }
              }
            )
    });    
  }

//ADDS A NEW RECORD TO THE TRANFER LIST COLLECTION
const addToTransferList = function(db, element, callback) {
    // Get the documents collection
    const collection = db.collection('transaction_list');
    // Insert document
    collection.insertOne( element , function(err, result) {
      assert.equal(err, null);
      //console.log("Transaction Record added with ID: " + element.trans_id);
      callback(result);
    });

    collection.createIndex( { "trans_id": 1 }, { unique: true } )
  }

//ADDS A NEW RECORD TO THE RECURRING LIST COLLECTION
const addToReccuringList = function(db, element, callback) {
   // Preparing new document to be added to the collection
    var item = {
        name: element.name,
        user_id: element.user_id,
        next_amt: element.amount,
        next_date: '',
        transactions: [ element ],
    };
    // Get the documents collection
    const collection = db.collection('recurring_list');
    // Insert document
    collection.insertOne( item , function(err, result) {
      assert.equal(err, null);
      //console.log("Reacurring Record added with ID: " + element.trans_id);
      callback(result);
    });
  }

  /* ========== EXTRA FUNCTIONS ========== */

//GET RECURRING LIST ==>
const getRecurringListRecords = function(callback) {
    MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      console.log("Connected successfully to server");
        
      const db = client.db(dbName);

      getAllRecurringDocuments(db, callback, function() {
            client.close();
        });
    });
}

const getAllRecurringDocuments = function(db, res, callback) {
    // Get the documents collection
    const collection = db.collection('recurring_list');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following Recurring records");
      console.log(docs)
      res.send(JSON.stringify(docs));
      callback(docs);
    });
  }
// <==

//GET TRANSFER LIST ==>
const getTransfelListRecords = function(callback) {
    MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      console.log("Connected successfully to server");
        
      const db = client.db(dbName);

      getAllTransferDocuments(db, callback, function() {
            client.close();
        });
    });
}

const getAllTransferDocuments = function(db, res, callback) {
    // Get the documents collection
    const collection = db.collection('transaction_list');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs)
      res.send(JSON.stringify(docs));
      callback(docs);
    });
  }
// <==

//DELETE ALL RECORDS FROM TRANSFER LIST & RECURRING LIST ==>
const removeAllDocuments = function(callback) {
    MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      console.log("Connected successfully to server");
        
      const db = client.db(dbName);

      deleteAllDocuments(db, callback, function() {
            client.close();
        });
    });
}

const deleteAllDocuments = function(db, res, callback) {
    // Get the documents collection
    const rcollection = db.collection('recurring_list');
    //Delete all recods
    rcollection.deleteMany({});
    
    // Get the documents collection
    const collection = db.collection('transaction_list');
    //Delete all recods
    collection.deleteMany({});
    
    res.send('Collections Emptied');
    callback();
  }
// <==

  module.exports = { addRecord, getRecurringListRecords, getTransfelListRecords, removeAllDocuments }