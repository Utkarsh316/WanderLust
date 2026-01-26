const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "This Listing does not exist");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {

  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();


  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);         //or->new Listing(listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");

  //let listing = req.body.listing;
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;                        //id nikali from whole url
  const listing = await Listing.findById(id);    // go in Listing clln and find data with this specifi id
  if (!listing) {
    req.flash("error", "This Listing does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
  // found data is put in the template
  //res.render(): This command tells Express to generate an HTML page using a template. "listings/edit.ejs": 
  // This is the template file it will use. This file contains the HTML for your edit form. {listing}: This is the crucial part. 
  // It passes the data we found in the database (const listing = ...) to the edit.ejs template.
};

module.exports.updateListing = async (req, res) => {

  let { id } = req.params; // // 1. Get the ID of the listing to update from the URL
  // 2. Find the listing by its ID and update it with the new data
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  // 3. Redirect the user back to the updated listing's page
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};     