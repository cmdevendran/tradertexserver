var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var config = require('./../config');
var jwt    = require('jsonwebtoken');
//var User = require('./user');
var bcrypt = require('bcrypt');
var session = require('express-session');
//var MongoStore = require('connect-mongo')(session)
var mongo = require('mongodb');




var url = "mongodb+srv://owner:mqpbpKs1GfDTiliX@cluster0.t7rll.mongodb.net/tradertex?retryWrites=true&w=majority";

var db = mongojs(url);
var schema = mongojs.schema; 


var app = express();
app.set('superSecret', config.secret);


var MongoClient = require('mongodb').MongoClient;
//Connect to db:

var dbo;
MongoClient.connect(config.db, function(err, db) {
  if (err) throw err;
  console.log("Database connected!");

  dbo = db.db("tradertex");

 
}); 



  // Register user
  router.post('/rest/userregister', function(req, res) {
    console.log("within user-register mongodb");
    /*
    var new_user = new User({
      username: req.username
    });*/
    var username = req.body.mobilenumber;
    var password = req.body.pinnumber;

    console.log("username : "+req.body.mobilenumber);
    console.log("password : "+req.body.pinnumber);

    var hashpassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

    dbo.collection('user').findOne({mobilenumber: username}, function(err, user) {
      if(err){
        console.log(err);
        return res.status(500).send();
      }
     // console.log("before  user : "+JSON.stringify(user));
      if (user) {
        console.log(" user already exist")
        return res.status(404).send("User Already Exist");
               
      } else{
        console.log("creating new user")
        var isodate = new Date().toISOString()
        dbo.collection('user').insert({mobilenumber : username,pinnumber : hashpassword, profile_created : isodate}, function(err, data){
          if(err){
            console.log(err);
            return res.status(500).send("User Registration Error");
          }
         // return res.status(200).send("User registered successfully"+ data);
         console.log(JSON.stringify(data));
         return res.status(200).send(data);
    
        })
      }

    
    });
  
   // new_user.password = new_user.generateHash(userInfo.password);
/*     db.user.insert({username : username, lastname : LastName, firstname : FirstName,password : hashpassword}, function(err, user){
      if(err){
        console.log(err);
        return res.status(500).send();
      }
      return res.status(200).send();

    }); */
  });

  
  function requiresLogin(req, res, next) {
    console.log("requires login");
    if (req.session && req.session.userId) {
      console.log(req.session.userId);
      return next();
    } else {
      var err = new Error('You must be logged in to view this page.');
      err.status = 401;
      return next(err);
    }
  }
//


// check login information
router.post('/rest/profile', requiresLogin, function(req, res, next) {
  //...

  dbo.collection('user').findOne({username: 'Deva'},{ password :1}, function(err, user) {
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    if (user) {
      
          return res.status(200).send(user._id);
        
        
    }
     
      //password did not match
    });
  });

  function getUrlValue(val) {

    return val.then((abc) => abc);
  
  }
  
// Login to Mongodb

  router.post('/rest/login',  function(req, res,next) {
    var credentials = req.body;
    console.log(credentials);
    var username = req.body.mobilenumber;
    var password = req.body.pinnumber;
   
    console.log(username + ' '+ password);
    if(username==null || password==null){
      console.log("username or password null");
      return res.status(500).send();
    }
    var hashpassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  
    dbo.collection('user').findOne({mobilenumber: req.body.mobilenumber},{ pinnumber :1}, function(err, user) {
      if(err){
        console.log(err);
        return res.status(500).send();
      }
      console.log("before  user : "+JSON.stringify(user));
      if (user) {
        console.log("user: "+JSON.stringify(user));
        console.log("hash password : "+ hashpassword);
        console.log("user password : "+JSON.stringify(user.pinnumber));




  //-------------------
        bcrypt.compare(password, user.pinnumber, function(err, data) {
          var isodate = new Date().toISOString()
          if(err){
            console.log(err);
          }
          if(data==true){
            console.log("creating session for "+user._id)
            //Authenticatio success
            req.session = user._id;
            var sessionid ;
            getUrlValue(dbo.collection('sessions').updateOne({'session' : user._id},{'session' : user._id,'lastlogin': isodate},{upsert : true})).then((rs)=>{

              console.log("rs value" + rs)
              var o_id = new mongo.ObjectID(user._id);
              dbo.collection('sessions').findOne({'session':o_id},function(err, data){
                console.log("within getting session "+JSON.stringify(data))
                sessionid = data
                return res.status(200).send(data._id);

              })
             

            })
            /* dbo.collection('sessions').updateOne({'session' : user._id},{'session' : user._id,'lastlogin': isodate},{upsert : true}, function(err, d1) {
                if(err){
                  console.log(err)
                }
                
         
         

          }).then(function(hash){
            var o_id = new mongo.ObjectID(user._id);
            dbo.collection('sessions').findOne({'session':o_id},function(err, data){
              console.log("within getting session "+JSON.stringify(data))
              sessionid = data
            })
            return res.status(200).send(data._id);

          }) */}

          else if (data==false){

            return res.status(404).send("password does not match");
          }
          
         
          
      });
       
        //password did not match
      }
      else if(user==null){
        return res.status(404).send("No user found");
      }
     // console.log(data);
     
    });
  });
  



module.exports = router;
