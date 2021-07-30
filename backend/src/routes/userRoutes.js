const express = require('express');
const router = express.Router();
const passport = require('passport');
const customMiddleware = require("./customMiddleware")
const mongoose = require('mongoose');
const User = require('../models/user');
const { validate, Joi } = require('express-validation');

const registerValidation = {
    body: Joi.object({
        fullName: Joi.string().required(),
        username: Joi.string()
            .required()
            .min(8)
            .max(50),
        password: Joi.string()
            .required()
            .min(8)
            .max(50),
        role: Joi.string().required(),
    }),
}

const passwordValidation = {
    body: Joi.object({
        password: Joi.string()
            .required()
            .min(8)
            .max(50),
        newPassword: Joi.string()
            .required()
            .min(8)
            .max(50),
    })
}

router.post('/register', customMiddleware.isAuthenticated, customMiddleware.isAdmin, validate(registerValidation), (req, res, next) => {
    passport.authenticate('local-user-register', (err, newUser) => {

        // User is not created
        if (err) {
            return next(err);
        }
        if (!newUser) {
            return res.status(400).send({ status: "User exists" });
        }

        // TODO: Decide what information to be sent to the frontend
        return res.send({ userId: newUser._id, role: newUser.role, status: "User registered" });

    })(req, res, next)
})

router.post('/changePassword', customMiddleware.isAuthenticated, validate(passwordValidation), (req, res, next) => {
    let userId = req.session.passport.user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
        User.findById(userId).then(async (user) => {
            if (User.comparePassword(req.body.password, user.password)) {
                await user.updateOne({ $set: { password: User.encryptPassword(req.body.newPassword) } });
                res.send({ userId: user._id, status: "Password was changed" })
            }
            else {
                res.status(400).send({ status: "Wrong Password" });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).send({ status: "Invalid user" });
        })
    }
    else {
        res.status(400).send({ status: "Invalid user" });
    }
})

router.delete('/:username', customMiddleware.isAuthenticated, customMiddleware.isAdmin, async (req, res) => {
    let username = req.params.username
    User.findOneAndDelete({ username: username }).then(user => {
        if (user) {
            res.send({ status: "User deleted" });
        }
        else {
            res.status(400).send({ status: "User deletion failed" });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send({ status: "User deletion failed" });
    })

})

router.post('/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user) => {

        // User is not authenticated
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send({ status: "Bad credentials" });
        }

        // User is authenticated
        // Establish a login session
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.send({ userId: user._id, role: user.role, fullName: user.fullName, status: "Login successfull" });
        });

    })(req, res, next)

});

router.get('/logout', (req, res, next) => {
    req.logOut();
    res.send({ userId: null, status: "Logged out" });
});

module.exports = router;