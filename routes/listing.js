const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const router = express.Router();
const multer = require('multer');
const { isLoggedIn, isOwner, validateListing } = require('../middleware');
const listingController = require('../controllers/listings');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

router.route('/')
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

router.get('/new', isLoggedIn, listingController.new);

router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.edit));

router.route('/:id')
    .get(wrapAsync(listingController.show))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
