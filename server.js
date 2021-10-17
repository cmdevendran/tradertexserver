var express = require('express');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var mongojs = require('mongojs');
var ejwt = require('express-jwt');
var session = require('express-session');
var cors = require('cors')
var MongoStore = require('connect-mongo')(session)




var path = require('path');
var bodyParser = require('body-parser');
// test

var index = require('./routes/index');
var expense = require('./routes/expense');
var authenticate = require('./routes/authenticate');
var trip = require('./routes/trip');

//var port = 8080;

var app = express();
var morgan = require('morgan');

	//Access-Control-Allow-Headers
//After lots of googling I decided to npm install express and add
app.use(cors())

app.set('port', (process.env.PORT || 8080));

morgan.token('date', function() {
    var p = new Date().toString().replace(/[A-Z]{3}\+/,'+').split(/ /);
    return( p[2]+'/'+p[1]+'/'+p[3]+':'+p[4]+' '+p[5] );
});
app.use(morgan('combined'));



app.set('superSecret', config.secret); // secret variable


app.use(function(err, req, res, next) {
res.header('Content-type: application/json');
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, session, X-Requested-With, Content-Type, Accept, Authorization");
res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");



if (err.name === 'UnauthorizedError') {
  return res.status(403).send({
    success: false,
    message: 'No token provided.'
  });
}

next();
});

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Set Static Folder
app.use(express.static(path.join(__dirname, 'client')));

// Body Parser MW
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



app.use('/',index);
app.use('/expense', expense);
app.use('/trip', trip);
app.use('/authenticate',authenticate);



app.listen(app.get('port'),function(){
    console.log('Server started on port '+app.get('port'));
    var isodate = new Date().toISOString();
   // console.log(isodate.toLocaleTimeString());
    console.log('Server started at  '+isodate.replace(/z|t/gi,' ').trim());





});

module.exports = app;
