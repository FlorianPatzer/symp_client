const endpoints = require('./endpoints');
const path = require('path');

let dbName = 'symp'

module.exports = {
    mongodb: {
        URI: 'mongodb://' + endpoints.dbAddress + '/' + dbName,
        connectionOptions: {
            auth: {
                authSource: "admin"
            },
            user: "root",
            pass: "12ho4irhf",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }
    },
    jwtSecret: '12h4rfnlwqj192urjfifqf',
    sessionSecret: "Nxe9am@wv9QH8e6D*pWJ",
    certificateLocation: path.join(__dirname, '/' + endpoints.certsLocation + '/cert.crt'),
    privateKeyLocation: path.join(__dirname, '/' + endpoints.certsLocation + '/private.pem'),
};

