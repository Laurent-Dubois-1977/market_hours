const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const winston = require('./config/winston');
const uuid = require('uuid');
const session = require('express-session');
// const redisClient = require('./dbs/redis');  //<<ENABLE REDIS BY UNCOMMENTING THIS LINE
// const redisSessionStore = require('connect-redis')(session);   //<<ENABLE REDIS BY UNCOMMENTING THIS LINE
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const apiutils = require('./helpers/apiutils');
require('dotenv').config();
const port = process.env.PORT;
console.log("NODE_ENV="+process.env.NODE_ENV);
apiutils.scanEndpoints('startup');





// logs all http request using morgan and winston
app.use(morgan(':remote-addr :date[clf] :method :url :status :res[content-length] :response-time ms :user-agent', { stream: winston.httplogger.stream }));
// logs all request using morgan to the console
app.use(morgan('===> :date[clf] => :method :url :status :res[content-length] :response-time ms ', {immediate: false}));



///// setup session 
// length : 1 day = 86400 seconds
var sessionlength = 1000*86400*30; // 30 days
var safecookie = process.env.ENV == "PROD" ? true : false;
var sessionOptions = {
  genid: (req) => {
    return uuid.v4();
  },
  // store: redstore,  //<<ENABLE REDIS BY UNCOMMENTING THIS LINE
  name: '_sbac', 
  secret: process.env.SESSION_SECRET,
  resave: false,
  cookie: { secure: safecookie, maxAge: sessionlength }, // Set to secure:false and expire in 10 minute for demo purposes
  saveUninitialized: true,
  signed: true
};
app.use(session(sessionOptions));                           


// setup body parser options
app.use(bodyParser.json( { limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '2mb',
    extended: true
}));


// app.use(accessCtrl.checkClientAccess());
// start server on defined port
app.listen(port, () => {
  console.log("»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»");
  console.log(`»»» App listening to http://localhost:${port}`);
  console.log("»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»");
  winston.logAppEvent("Started the app server and listening on port "+`${port}`);
}); 

// connect to mongo
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_URL);
console.log(process.env.MONGO_URL);
winston.logAppEvent("Connected to mongodb database");

// cors handling (KEEP THIS ON TOP OF ROUTE REQUIRE CALLS)
// this covers requests made in a browser and only allows the UI we created. 
// API requests from non web app are not concerned by this as it is not called from a browser
const whitelist = [
  'http://localhost:4200',
  'http://localhost',
  'http://localhost:7000'
];

const corsoptions = {
  origin: function (origin, callback) {
    // console.log(origin);
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true
}; 

//TODO: remove this for prod
app.all('*', cors(corsoptions));


// loads all mongoose models 
fs.readdirSync(__dirname + '/models/mongoose').forEach(function(filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/mongoose/' + filename);
});
// loads all api_routes
fs.readdirSync(__dirname + '/api_routes').forEach(function (filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/api_routes/' + filename)(app, mongoose); 
});  


//cookies validation
// TODO: Setup cookie signing and other cookies security methods
// app.use(cookieParser(process.env.COOKIE_SECRET));





