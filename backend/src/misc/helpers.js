const Engine = require('../models/engine');
const axios = require('axios').default;
const https = require('https');

function getActiveEngine() {
    return new Promise(resolve => {
        Engine.findOne({ listen: true })
            .then(engine => {
                resolve(engine);
            })
    })
}

module.exports.getActiveEngine = getActiveEngine;