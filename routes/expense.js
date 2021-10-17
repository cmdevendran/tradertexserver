

var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
const { db } = require('./../config');
var config = require('./../config');


var MongoClient = require('mongodb').MongoClient;
//Connect to db:

var dbo;
MongoClient.connect(config.db, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  dbo = db.db("expense_tracker");

 
}); 

//var db = mongojs(config.db);
var ObjectID = mongojs.ObjectID;

// used to get the categories for expense form
router.post('/getcat/', verifySession, function (req, res, next) {
  console.log("within getcat called");

  dbo.collection('category').findOne({ "name": "category", "userid":req.headers.session }, { "categories": 1 },
    function (err, restaurants) {
      if (err) {
        res.send(err);
      }
      res.json(restaurants);
      console.log("From get Restaurant menthod : " + restaurants);
    });


});

// returns the expenses
router.post('/getexpenses/', verifySession, function (req, res, next) {
  console.log("within Expenses called");
  console.log(req.body);
//  console.log(req.body.credential.startDate);
  startDate = req.body.startDate;
  endDate = req.body.endDate;
  session = req.headers.session;



  console.log( "in get expenses : "+ startDate +" "+endDate);

  if(!startDate && !endDate) {
      console.log("No start and end date");

      dbo.collection('expense_entries').find({'userid':session,
      'expdate' :{
        'gte' : (new Date(startDate).toISOString()),
      
        '$lte' :  (new Date(endDate).toISOString())
     }
        }).limit(10).sort({expdate:-1}).toArray(
        function (err, restaurants) {
          if (err) {
            res.send(err);
          }
          res.json(restaurants);
          console.log("From get Restaurant menthod : " + restaurants);
        });
  } else if(!startDate){
    console.log("only start date");
    dbo.collection('expense_entries').find({'userid':session, 'expdate' :{
      
         '$lte' :  (new Date(endDate).toISOString())
      }
      }).sort({expdate:-1}).toArray(
      function (err, restaurants) {
        if (err) {
          res.send(err);
        }
        res.json(restaurants);
        console.log("From get Restaurant menthod : " + restaurants);
      });

  }else if(!endDate){
    console.log("only end date" +"session : "+session);
    dbo.collection('expense_entries').find({'userid':session, 'expdate' :{
      '$gte' : (new Date(startDate).toISOString())
         
      }
      }).sort({expdate:-1}).toArray(
      function (err, restaurants) {
        if (err) {
          res.send(err);
        }
        res.json(restaurants);
        console.log("From get Restaurant menthod : " + restaurants);
      });

  }else{
    console.log("have both date");
    console.log("have both date"+startDate);
    console.log("have both date"+endDate);
    dbo.collection('expense_entries').find({'userid':session, 'expdate' :{
       '$gte' : mimicISOString(startDate,"startDate"),
        '$lte' :  mimicISOString(endDate,"endDate") 
        

      }
      }).sort({expdate:-1}).toArray(
      function (err, restaurants) {
        if (err) {
          console.log(err)
          res.send(err);
        }
        res.json(restaurants);
        console.log("From get Restaurant menthod : " + restaurants);
      });
   }





});




function mimicISOString(date,value) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    if(value=="startDate")
        return [year, month, day].join('-') +'T00:00:00.000Z';
    else if(value=="endDate")
         return [year, month, day].join('-') +'T23:59:00.000Z';
        


}

console.log(mimicISOString(new Date()));


function verfiyAuth(req, res, next) {
  console.log("Witin VerifyAuth " + JSON.stringify(req.headers));
  if (req.get('session')) {
    // add custom to your request object
    req._custom = req.get('session');
    console.log("Auuthorisatoin  header : " + JSON.stringify(req._custom));
    next();
  }
}
// USED to check the session is active or not. if session not available then most of things should not proceed.
function verifySession(req, res, next) {
  console.log(JSON.stringify(req.headers));
  console.log(" req login 1: " + req.headers.session);
  if (req.get('session')) {
    console.log(" req login 2 : " + req.headers.session);
    dbo.collection('sessions').findOne({ "session": mongojs.ObjectId(req.headers.session) }, function (err, data) {
      if (err) {
        console.log("verify session within db.session " + err);
        err.status = 401;
        return next(err);
      }
      if (data == null) {
        console.log("verify session within db.session " + data);
        res.status = 401;
        return next(res);
      }


      console.log("verify session : " + JSON.stringify(data));
      return next();



    });
    //console.log("verify session 2 : "+JSON.stringify(data));

  } else {
    var err = new Error('You must have session in to view this page.');
    err.status = 401;
    return next(err);
  }
}



function requiresLogin(req, res, next) {
  console.log("requires login");

  console.log(JSON.stringify(req.headers));
  console.log(" req login : " + req.headers.session);

  if (req.session && req.session.userId) {
    console.log("console requires login : " + req.session.userId);
    console.log("console requires login : " + req.session);
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

router.post('/postexp/',verifySession, function (req, res, next) {
  var expcat = req.body.expcat;
  var expdate = req.body.expdate;
  var expamount = req.body.expamount;
  var expremark = req.body.expremark;

  var isodate = new Date(expdate).toISOString();
  console.log("iso_expdate : " + isodate)
  dbo.collection('expense_entries').insert({
    "expcat": req.body.expcat,
    "expdate": isodate,
    "userid":req.headers.session ,
    // "expamount" : req.body.expamount,
    // "expamount" : parseFloat(expamount),
    "expamount": Number(expamount),
    "expremark": req.body.expremark,
    "exppaymentmode" : req.body.exppaymentmode

  }, function (err, data) {
    if (err) {
      res.send(err);
    }
    res.json(data);
    console.log("From get Restaurant menthod : " + data);
  });






});


  /***
   * 
   *  Delete Expense
   * 
   
   */

  router.post('/deleteexp/', verifySession, function (req, res, next) {

    var session = req.headers.session;
    console.log("within expenses.." + session)

    dbo.collection('expense_entries').remove({
      "_id": mongojs.ObjectId(req.body._id)
    }, function (err, data) {
      if (err) {
        res.send(err);
      }
      res.json(data);

    });



  });

module.exports = router;