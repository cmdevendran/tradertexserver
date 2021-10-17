module.exports = {

'header': {
  "alg": "HS256",
  "typ": "JWT"
},
    'secret': 'sgrestaurant@1234S',
   //'db' : 'mongodb://expense_admin:deva%401234D@ds125906.mlab.com:25906/expense_tracker', 
    'db':'mongodb+srv://expense_admin:AVwC7jKLDsiZWVpz@expense-tracker.rjqyt.mongodb.net/expense_tracker?retryWrites=true&w=majority',
    'env': 'DEV',
    
   
// PROD for production environment
// DEV for dev environment
/**
 * 
 * const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://expense_admin:<password>@expense-tracker.rjqyt.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
 */
};
