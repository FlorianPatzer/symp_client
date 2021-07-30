const proxy = require('express-http-proxy');
const Settings = require('../models/settings');
const dynamicMiddleware = require('express-dynamic-middleware');
const customMiddleware = require("../routes/customMiddleware");

let appReference = null;
let dynamicLoadedProxies = [];

function configureProxies(app) {
    appReference = app;
    reloadEndpoints().then(endpoints => {
        addProxy(app, '/proxy/sme', endpoints.sme);
        addProxy(app, '/proxy/camunda', endpoints.camunda);
        console.log("Proxies ready");
    })
}

function reloadProxies() {
    console.log("Reloading proxies");
    if (appReference) {
        cleanProxies();
        configureProxies(appReference);
    }
    else {
        console.log("Can't reload proxy. No app reference.");
    }
}

function reloadEndpoints() {
    return new Promise(resolve => {
        Settings.findOne().then(settings => {
            resolve(settings.endpoints);
        })
    })
}

function cleanProxies() {
    dynamicLoadedProxies.forEach(proxy => {
        proxy.clean();
    })
}

function addProxy(app, address, endpoint) {
    if (endpoint.length > 0) {
        let dynamicProxy = dynamicMiddleware.create(proxy(endpoint));
        app.use(address, customMiddleware.isAuthenticated, dynamicProxy.handle());
        dynamicLoadedProxies.push(dynamicProxy);
    } else {
        console.log("No endpoint to connect to " + address)
    }
}

module.exports.configureProxies = configureProxies;
module.exports.reloadProxies = reloadProxies;