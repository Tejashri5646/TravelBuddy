const Listing = require('../models/listing');
const { cloudinary } = require('../cloudConfig');

module.exports.index = async (req, res) => {
    const listings = await Listing.find({});
    res.render('listings/index', { listings });
};

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('owner');
    if (!listing) {
        req.flash('error', 'Listing you requested does not exist!');
        return res.redirect('/listings');
    }
    res.render('listings/show', { listing });
};

module.exports.new = (req, res) => {
    res.render('listings/new');
};


module.exports.createListing = async (req, res) => {
    console.log('File Upload Data:', req.file);
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url,".. ",filename);
    const newListing = new Listing(req.body.Listing);
    newListing.owner = req.user._id;
    newListing.image = { url,filename};
        await newListing.save();
    req.flash('success', 'New listing created');
    res.redirect("/listings");
};


module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing you requested does not exist!');
        return res.redirect('/listings');
    }
    let ogImageUrl = listing.image.url;
    ogImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render('listings/edit', { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(url,".. ",filename);
        listing.image = {url,filename};
        await listing.save();
    }

    req.flash('success', 'Updated successfully!');
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
};
