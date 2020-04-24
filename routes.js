const passport    = require('passport');
const bcrypt      = require('bcrypt');
const mongoose = require("mongoose");

module.exports = function(app, userModel, db) {
  const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      console.log("Authenticated");
      return next();
    }
    console.log("not authenticated");
    res.redirect("/");
  };

  app.route("/").get((req, res) => {
    //Change the response to render the Pug template
    res.render(process.cwd() + "/views/pug/index", {
      title: "Home page",
      message: "Please login",
      showLogin: true,
      showRegistration: true
    });
  });

  app
    .route("/login")
    .post(
      passport.authenticate("local", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/profile");
      }
    );

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + "/views/pug/profile", {
      username: req.user.username
    });
  });

  app.route("/register").post(
    (req, res, next) => {
      userModel.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          var hash = bcrypt.hashSync(req.body.password, 13);
          userModel.create(
            {
              username: req.body.username,
              password: hash
            },
            (err, newUser) => {
              if (err) {
                res.redirect("/");
              } else {
                next(null, newUser);
              }
            }
          );
        }
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      req.session.username = req.user.username;
      res.redirect("/profile");
    }
  );

  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.use((req, res, next) => {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });
};
