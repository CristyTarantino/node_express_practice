const session     = require('express-session');
const passport    = require('passport');
const ObjectID    = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt      = require('bcrypt');

module.exports = function(app, userModel, db) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true
    })
  );

  app.use(passport.initialize());

  app.use(passport.session());

  passport.serializeUser((user, done) => {
    console.log(user._id);
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    userModel.findById(id, (err, doc) => {
      done(null, doc);
    });
  });

  passport.use(
    new LocalStrategy((username, password, done) => {
      userModel.findOne({ username: username }, (err, user) => {
        console.log("User " + username + " attempted to log in.");
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false);
        }
        return done(null, user);
      });
    })
  );
};