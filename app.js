const express = require('express');
const app = express();
app.use(express.static(__dirname + '/View'));
const port =  process.env.PORT || 1984;

var MongoFunctions = require('./functions/mongoFunction');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', (req, res) => res.sendFile(path.join('index.html')) );

app.get('/getRecurringlist', function(req, res) {
  MongoFunctions.getRecurringListRecords(res);
});

app.get('/getTransferlist', function(req, res) {
  MongoFunctions.getTransfelListRecords(res);
});

app.get('/removeAllRecords', function(req, res) {
  MongoFunctions.removeAllDocuments(res);
});

app.post('/', function(req, res) {
    const transactions = req.body;
    req.setTimeout(10000);
    MongoFunctions.addRecord(transactions, res);
});

app.listen(port, () => console.log(`Node App runnnig on port ${port}!`))