var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var config = require('../config');
var mongo = require('mongodb');


var app = express();
app.set('superSecret', config.secret);


var MongoClient = require('mongodb').MongoClient;
ObjectID = require('mongodb').ObjectID

//Connect to db:
const uri = "mongodb+srv://owner:mqpbpKs1GfDTiliX@cluster0.t7rll.mongodb.net/tradertex?retryWrites=true&w=majority";
//const uri = 'mongodb+srv://expense_admin:AVwC7jKLDsiZWVpz@expense-tracker.rjqyt.mongodb.net/expense_tracker?retryWrites=true&w=majority';

var dbo = null;
var db = null
MongoClient.connect(uri, function(err, db) {
  if (err) throw err;
  console.log("Database connected!");

  dbo = db.db("tradertex");
  

}); 

// USED to check the session is active or not. if session not available then most of things should not proceed.
function verifySession(req, res, next) {
  console.log(new Date() + "  header session   ...\n"+JSON.stringify(req.headers));
  var session = req.headers.session
  console.log(" req login 1: " + "session");
  if (session) {
    var o_id = new mongo.ObjectID(session);

    console.log(" req login 2 : " + o_id);
    dbo.collection('sessions').findOne({ "_id": o_id}, function (err, data) {
      if (err) {
        console.log(" Error within db.session " + err);
        err.status = 401;
        return next(err);
      }
      if (data == null) {
        console.log("verify session null in db.session " + JSON.stringify(data));
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



/**
 * 
 * to get the recent 10 trips
 * 
 */

router.post('/getitemlist/',verifySession, function (req, res, next) {

  var session = req.headers.session;
  console.log("within items.." + session)
  var cat_id = req.body.item_id
  console.log("item id : "+ cat_id)
  // returns the set with the sort date latest as the first records

 //db.itemlist.find({}).limit(10).sort({tripdate:-1}, function (err, data) {
  dbo.collection('postadvt').find({'item_cat' : cat_id}).toArray( function (err, data) {
    if (err) {
      res.send(err);
    }
    res.json(data);
    //console.log("getting recent trips : " + JSON.stringify(data));
  });

});


/* Get all the categories  */
router.post('/getcategories/',verifySession, function (req, res, next) {

  var session = req.headers.session;
  console.log("within get Categories.." + session)


  // returns the set with the sort date latest as the first records

 //db.itemlist.find({}).limit(10).sort({tripdate:-1}, function (err, data) {
  dbo.collection('Categories').find().toArray( function (err, data) {
    if (err) {
      res.send(err);
    }
    res.json(data);
    //console.log("getting recent trips : " + JSON.stringify(data));
  });

});
/* 
The postadvt method is used to post advt for both sell and buy 
 */
router.post('/postadvt/',function (req, res, next) {

  var session = req.headers.session;
  var o_id = new mongo.ObjectID(session);
  console.log("within get postadvt.." + session)

  dbo.collection('sessions').findOne({"_id":o_id},function(err, data){
    var sess = data.session
    console.log("sess" +sess)

      dbo.collection('user').findOne({"_id":ObjectID(sess)},{profile_name:1,profile_company:1,mobilenumber:1,_id:1},function(err,data){
          if (err) {
            res.send(err);
          }
          var user = data;
          
          console.log("user : "+user)
          var isodate = new Date().toISOString();
        console.log("iso_expdate : " + isodate)
              dbo.collection('postadvt').insert({
                "item_desc" : req.body.item_desc,
                "item_qty" : Number(req.body.item_qty),
                "item_uom" : req.body.item_uom,
                "item_price" : Number(req.body.item_price),
                "item_cur" : req.body.item_cur,
                "item_cat" : req.body.item_cat,
                "item_remark" : req.body.item_remark,
                "item_trade" : req.body.item_trade,
                "item_posteddate": isodate,
                "item_postid":user._id, // advt posted user id
                "item_postedname" : user.profile_name, // advt posted user name
                "item_postedcompany" : user.profile_company

            /*     'item_postedby' : user.name,
                'item_contactnumber' : user.item_contactnumber,
                'item_phonenumber' : user.item_phonenumber  */
              
              }, function (err, data) {
                if (err) {
                  res.send(err);
                }
                res.json(data);
                console.log("From get postadvt menthod : " + data);
              });
            
              });



            })

 

  
});



router.post('/postprofile/',function (req, res, next) {

  var session = req.headers.session;
  var o_id = new mongo.ObjectID(session);



    console.log(profile_name)
  //var session = "6096a11139461b286b101389"

  console.log("within get postprofile.." + session)
  dbo.collection('sessions').findOne({ "_id": o_id}, function (err, data) {
    console.log(data)
    

    var isodate = new Date().toISOString();
    dbo.collection('user').updateOne({_id:ObjectID(data.session)},
 
    {
      $set: { 
              'profile_name' : req.body.profile_name,
              'profile_company' : req.body.profile_company,
              'profile_addr1' : req.body.profile_addr1,
              'profile_addr2' : req.body.profile_addr2,
              'profile_city' : req.body.profile_city,
              'profile_state' : req.body.profile_state,
              'profile_country' : req.body.profile_country,
              'profile_postalcode' : req.body.profile_postalcode,
              'profile_gst' : req.body.profile_gst,
              'item_updateddate': isodate,
           } 
    }
    
    ), function (err, data) {
      if (err) {
        res.send(err);
      }
      res.json(data);
      console.log("From get profile menthod : " + data);
    }


  })




 
});



 




module.exports = router;