//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

//Middleware
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true}));

// Connecting to mongodb
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// Creating schema
const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const newUser = new User({
        email : req.body.username,
        password : req.body.password
    });
    newUser.save();
    res.render("secrets");
});

app.post("/login",async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user=await User.findOne({email:username});

    if(!user){
        console.log("user not found");
    };

    try {

        if(user.password == password) {
            res.render("secrets");
        }
    } catch(err) {
        console.log("Password is wrong");
        console.log(pw);
    };

});

app.listen(3000, (req, res) => {
    console.log("Server is listening on port: 3000...");
})