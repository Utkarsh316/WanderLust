// Your app.js file is your server. In a Node.js/Express application, it's the central control hub. 
// Its main job is to listen for requests from the browser and decide what to send back.

const express = require( "express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

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

app.get( "/", (req,res) => {
    res.send("Hi, I am home");
});


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {

        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};




//index route
app.get("/listings", wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
}));

//New Route
app.get("/listings/new", (req,res) =>{
   res.render("listings/new.ejs"); 
}

)

//show route
app.get("/listings/:id",wrapAsync (async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
})
);

// Create Route
app.post(
    "/listings",
    validateListing,
    wrapAsync( async (req,res,next)=> {
   
    const newListing = new Listing(req.body.listing);         //or->new Listing(listing);
    await newListing.save();
    res.redirect("/listings");

                                                  //let listing = req.body.listing;
})
); 

//Edit Route
//Purpose: To fetch the existing data for one specific item from the database and display it in an HTML form so the user can edit it.
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
     let {id} = req.params;                        //id nikali from whole url
    const listing = await Listing.findById(id);    // go in Listing clln and find data with this specifi id
    res.render("listings/edit.ejs", {listing});    // found data is put in the template
    //res.render(): This command tells Express to generate an HTML page using a template. "listings/edit.ejs": 
    // This is the template file it will use. This file contains the HTML for your edit form. {listing}: This is the crucial part. 
    // It passes the data we found in the database (const listing = ...) to the edit.ejs template.
}))

//Update route
//Purpose: To receive the new, modified data that the user submitted through the form and use it to update the database.
app.put(
    "/listings/:id",
    validateListing,
    wrapAsync (async (req, res) => {
  
    let { id } = req.params; // // 1. Get the ID of the listing to update from the URL

    // 2. Find the listing by its ID and update it with the new data
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // 3. Redirect the user back to the updated listing's page
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
  let {id} = req.params;
  let deletedListng = await Listing.findByIdAndDelete(id);  
  res.redirect("/listings");
}));

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

