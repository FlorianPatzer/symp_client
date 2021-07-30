const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use('local-user-register', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const user = await User.findOne({ username: username });
    if (user) {
        return done(null, false);
    } else {
        let role = req.body.role;
        let fullName = req.body.fullName;

        const newUser = new User();
        newUser.username = username;
        newUser.password = newUser.encryptPassword(password);
        newUser.role = role;
        newUser.fullName = fullName;

        await newUser.save();
        done(null, newUser);

    }
}));

passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const user = await User.findOne({ username: username });
    if (!user) {
        return done(null, false);
    }
    if (!user.comparePassword(password)) {
        return done(null, false);
    }
    done(null, user);
}));