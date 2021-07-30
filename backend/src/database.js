const mongoose = require('mongoose');
const { mongodb } = require('./keys');

function connect() {
    return new Promise((resolve, reject) => {
        mongoose.connect(mongodb.URI, mongodb.connectionOptions)
            .then(db => resolve(true))
            .catch(err => resolve(false))
    })
}

function connectWithRetry(retryCount, delayMs) {
    return new Promise(async (resolve, reject) => {
        for (let currentRetry = 0; currentRetry < retryCount; currentRetry++) {
            let status = await connect();
            if (status) {
                return resolve(true)
            }
            await new Promise(r => setTimeout(r, delayMs));
            console.log("Database connection failed. Retry", (currentRetry + 1), "of", retryCount)
        }
        return reject(false)
    })
}

module.exports.connect = connect
module.exports.connectWithRetry = connectWithRetry