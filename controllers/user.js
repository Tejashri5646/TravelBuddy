const User = require("../models/user.js");
module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
}
module.exports.login = (req, res) => {
    req.flash("success", "Welcome to TravelBuddy");
    console.log("Login successful, redirecting to:", req.session.returnTo || '/listings');
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};
module.exports.renderSignup =  (req, res) => {
    res.render("users/signup.ejs");
};
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to TravelBuddy");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};
module.exports.logout =  (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged you out!");
        res.redirect("/listings");
    });
};
