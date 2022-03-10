const express = require('express');
const path = require('path');
const router = require('./routes/routes');
const expressSession = require('express-session');
const MemoryStore = require('memorystore')(expressSession);
const passport = require('passport');
const multer = require('multer');
const methodOverride = require('method-override');
const app = express();


// MIDDLEWARES
// BODY-PARSER
app.use(express.urlencoded({extended : false}));
// STATIC FILES
app.use(express.static(path.join(__dirname , "public")));
// METHOD OVERRIDE
app.use(methodOverride('_method'));

// VIEWS
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , "views"));



// EXPRESS SESSIONS
app.use(expressSession({
    secret : "random",
    resave : true,
    saveUninitialized : false,
    maxAge : 60*1000,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
}));

app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use("/" , router);


const PORT = process.env.PORT || 3000;
// LISTEN
app.listen(PORT , ()=>{
    console.log("server up and running");
});
