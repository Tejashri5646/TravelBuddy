const express = require("express");
const Review = require("../models/review.js"); // Import the Review model

const wrapAsync = require('../utils/wrapAsync.js');
const router = express.Router({mergeParams:true});
const {validateReview,isLoggedIn} = require("../middleware.js");
const Listing = require("../models/listing.js");
const reviewController = require("../controllers/review.js");

router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

// Delete Review Route 
router.delete('/:reviewId',isLoggedIn, wrapAsync(reviewController.destroyReview));

module.exports = router;