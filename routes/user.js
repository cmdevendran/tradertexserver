/**var mongojs = require('mongojs');

var config = require('./../config');


var db = mongojs(config.db);
//var Schema = db.Schema;
var bcrypt = require('bcrypt-nodejs');



var userSchema ;
  
  // hash the password
  userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };
  
  // checking if password is valid
  userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };
  var User = db.model('user', userSchema);
  module.exports = User;*/
