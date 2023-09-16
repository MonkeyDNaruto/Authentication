//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

//Middleware
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());

app.use(passport.session());

// Connecting to mongodb
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// Creating schema
const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if(req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logout((function(err) {
        if(err) {
            console.log(err);
        }
    }));
    res.redirect("/");
    
});

app.post("/register", (req, res) => {

    User.register({username: req.body.username}, req.body.password, function (err, user) {
        if(err) {
            consolr.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })



    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email : req.body.username,
    //         password : hash
    //     });
    //     newUser.save();
    //     res.render("secrets");
    // });

});

app.post("/login",async (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            });
        }
    });



    // const username = req.body.username;
    // const password = req.body.password;

    // const user=await User.findOne({email:username});

    // if(!user){
    //     console.log("user not found");
    // };

    // try {
    //     bcrypt.compare(password, user.password, function(err, result) {
    //         // result == true
    //         if(result === true) {
    //             res.render("secrets");
    //         }
    //     });
    // } catch(err) {
    //     console.log("Password is wrong");
    //     console.log(pw);
    // };

});

app.listen(3000, (req, res) => {
    console.log("Server is listening on port: 3000...");
})