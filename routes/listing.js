const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");





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
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
}

)

//show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
      req.flash("error", "This Listing does not exist"); 
      return res.redirect ("/listings");
    }
    res.render("listings/show.ejs", { listing });
})
);

// Create Route
router.post(
    "/",
    validateListing,
    wrapAsync(async (req, res, next) => {

        const newListing = new Listing(req.body.listing);         //or->new Listing(listing);
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");

        //let listing = req.body.listing;
    })
);

//Edit Route
//Purpose: To fetch the existing data for one specific item from the database and display it in an HTML form so the user can edit it.
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;                        //id nikali from whole url
    const listing = await Listing.findById(id);    // go in Listing clln and find data with this specifi id
    if(!listing){
      req.flash("error", "This Listing does not exist"); 
      return res.redirect ("/listings");
    }
   
    res.render("listings/edit.ejs", { listing });    // found data is put in the template
    //res.render(): This command tells Express to generate an HTML page using a template. "listings/edit.ejs": 
    // This is the template file it will use. This file contains the HTML for your edit form. {listing}: This is the crucial part. 
    // It passes the data we found in the database (const listing = ...) to the edit.ejs template.
}))

//Update route
//Purpose: To receive the new, modified data that the user submitted through the form and use it to update the database.
router.put(
    "/:id",
    validateListing,
    wrapAsync(async (req, res) => {

        let { id } = req.params; // // 1. Get the ID of the listing to update from the URL

        // 2. Find the listing by its ID and update it with the new data
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        // 3. Redirect the user back to the updated listing's page

        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    }));

//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
   
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
})
);

module.exports = router;