const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id).populate("reviews");
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;
    listing.reviews.push(newReview);  

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
        let { id, reviewId } = req.params;

        // 1. Pull (remove) the review ID from the Listing's reviews array
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        // 2. Delete the actual Review document from the reviews collection
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted");
        res.redirect(`/listings/${id}`);
    };