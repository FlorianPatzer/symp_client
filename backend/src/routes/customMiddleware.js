const User = require('../models/user');
const Engine = require('../models/engine');
const keys = require('../keys');
const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.status(401).send({ status: "Not authorized" })
    }
}

async function isAdmin(req, res, next) {

    let userId = req.session.passport.user
    let user = await User.findOne({ _id: userId })

    if (user.role == "admin") {
        return next();
    }
    else {
        res.status(401).send({ status: "Unsufficient rights" })
    }
}


// Check if the request is comming from the analysis engine that the app is listening to
async function isAnalysisEngine(req, res, next) {
    let isEngine = false;

    try {
        let payload = jwt.verify(req.headers["token"], keys.jwtSecret);
        let engine = await Engine.findOne({ uuid: payload.uuid});
        if (engine) {
            isEngine = true;
        }
    } catch (err) {}

    if (isEngine) {
        return next();
    }
    else {
        res.status(401).send({ status: "Unsufficient rights" })
    }
}

module.exports.isAdmin = isAdmin
module.exports.isAuthenticated = isAuthenticated
module.exports.isAnalysisEngine = isAnalysisEngine