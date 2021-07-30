const express = require('express');
const router = express.Router();
const customMiddleware = require("./customMiddleware")
const Settings = require('../models/settings');
const proxy = require('../misc/proxy')

router.post('/', customMiddleware.isAuthenticated, customMiddleware.isAdmin, (req, res, next) => {
    Settings.findOneAndUpdate({}, req.body).then(data => {
        proxy.reloadProxies();
        res.send();
    })
})

router.get('/', customMiddleware.isAuthenticated, (req, res, next) => {
    Settings.findOne().then(data => {
        res.send(data);
    })
})

module.exports = router;