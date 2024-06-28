const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/travelBuddy";

main().then(() => {
    console.log("Connected to Database");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const modifiedData = initData.data.map((obj) => ({ ...obj, owner: "6651e5ec54abc6f5e299b51f" }));
    await Listing.insertMany(modifiedData);
    console.log("Data was initialized");
}

initDB();
