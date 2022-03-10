const googleStrategy = require("passport-google-oauth20").Strategy;
const {User} = require("../modals/User");
require('dotenv').config();


const googleVerify = (passport)=>{
    // console.log(passport);
    passport.use(new googleStrategy({
        // The google s strategy has three key values
        clientID : process.env.clientId,
        clientSecret : process.env.clientSecreT,
        callbackURL : "http://localhost:3000/google/callback"

        // this callback function gives us three things 
    },(accessToken , refreshToken , profile , done)=>{
        // We can get all the emails connected to that google account
        // Find if a user exists with this email or not
        User.findOne({email : profile.emails[0].value} , (err , data)=>{
            if(err) console.log(err);
            if(data){
                // user exists
                // update data
                return done(null , data);
            }
            else{
                console.log("hello world");
                // create a user
                User({
                    nickname : profile.displayName,
                    email : profile.emails[0].value,
                    googleId : profile.googleId,
                    avatar : profile.photos[0].value
                }).save((err , data)=>{
                    return done(null , data);
                });
            }
        });
    }
    
    ));

    // These two functions are same for both the local and google authentication
    // serialize and deserialize
    passport.serializeUser((user , done)=>{
        done(null , user.id);

    });
    passport.deserializeUser((id , done)=>{
        User.findById(id , (err , user)=>{
            done(err , user);
        });
    });
}

module.exports = googleVerify;