// Your app.js file is your server. In a Node.js/Express application, it's the central control hub. 
// Its main job is to listen for requests from the browser and decide what to send back.

const express = require( "express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");


const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); //this lines creates a middleware that searches for"_method" in every incoming parcel
//You could name it something else (e.g., app.use(methodOverride("_action"))),
//  but then your form would need to match it (?_action=PUT). _method is the standard convention.
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
//express.static->built-in middleware;Its job is to serve static files;just need to tell it which folder contains all your static files.
//__dirname provides the guaranteed, absolute path to the folder your script lives in.(like giving a gps chip to your script)
//path.join() then safely adds /public to that path.


const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};


app.get( "/", (req,res) => {
    res.send("Hi, I am home");
});


app.use(session(sessionOptions));
app.use(flash());

app.use( (req, res, next)=>{
    res.locals.success = req.flash("success");
  
    next();
} );





app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);




 app.use((req, res, next) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});


app.use((err,req,res,next)=>{
    let{statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
});


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

