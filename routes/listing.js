const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
        validateListing,
    wrapAsync(listingController.createListing)
  );
  
//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm );

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) //show route
  .put(                                          //update route
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));  //Delete Route




//Edit Route
//Purpose: To fetch the existing data for one specific item from the database and display it in an HTML form so the user can edit it.
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
     wrapAsync(listingController.renderEditForm)
    );


module.exports = router;