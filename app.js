const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require('./routes/listing.js');
const review = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const dbUrl = process.env.ATLASDB_URL;

// Middleware setup
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to Database");
    })
    .catch((err) => {
        console.log(err);
    });

// Session configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("Error in mongo session store",err);
})
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
    
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Debugging middleware
app.use((req, res, next) => {
    console.log("Session:", req.session);
    console.log("User:", req.user);
    next();
});

app.get("/demouser", async (req, res) => {
    try {
        let email = "student2@gmail.com";
        let username = "delta-user2";
        let password = "Helloworld2";

        let existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with the given email or username is already registered' });
        }

        let fakeUser = new User({ email, username });
        let newUser = await User.register(fakeUser, password);

        res.status(200).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred during user creation' });
    }
});

// Routes setup
app.use('/listings', listings);
app.use('/listings/:id/reviews', review);
app.use('/', userRouter);

// MongoDB connection setup
// const MONGO_URL = "mongodb://127.0.0.1:27017/travelBuddy";


// Default route
// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

// Error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).send(message);
});

// 404 Not Found handling middleware
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});
