const express = require('express');
const router = express.Router();
const customMiddleware = require("./customMiddleware");
const Engine = require('../models/engine');
const endpoints = require('../endpoints');
const axios = require('axios').default;
const https = require('https');
const fs = require('fs');
const keys = require('../keys');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

function deactivateAppInOldEngine() {
    return new Promise((resolve) => {
        Engine.findOneAndUpdate({ listen: true }, { $set: { listen: false } }).then(engineData => {
            if (engineData) {
                let localAgent = new https.Agent({
                    ca: new TextEncoder().encode(engineData.cert)
                });
                axios.post(engineData.URI + "/app/deactivate", {}, { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {
                    resolve(true);
                }).catch(err => {
                    resolve(false);
                })
            }
            else {
                resolve(true);
            }
        })
    })
}

function getActiveEngine() {
    return new Promise(resolve => {
        Engine.findOne({ listen: true })
            .then(engine => {
                resolve(engine);
            })
    })
}

router.post('/register', customMiddleware.isAuthenticated, customMiddleware.isAdmin, async (req, res, next) => {
    let engine = new Engine();
    engine.subscribedAs = req.body.subscribedAs;
    engine.cert = req.body.cert;
    engine.URI = req.body.URI;
    engine.listen = false
    engine.uuid = uuidv4();

    // Engine certificate used to authenticate the engine
    let localAgent = new https.Agent({
        ca: new TextEncoder().encode(engine.cert)
    });
    
    // Client Certificate to send to the engine
    let certData = fs.readFileSync(keys.certificateLocation).toString('base64');

    let engineReq = {
        key: engine.subscribedAs,
        active: false,
        reportCallbackURI: endpoints.selfAddress + "/report",
        certificate: certData,
        token: jwt.sign({ uuid: engine.uuid }, keys.jwtSecret),
    }

    axios.post(engine.URI + "/app/register", engineReq, { httpsAgent: localAgent, headers: { token: "" } }).then(engineResp => {
        engine.token = engineResp.data.token;
        engine.save()
            .then(data => {
                res.send({ reportId: data._id, status: "Engine was added successfully" });
            })
            .catch(err => {
                res.status(500).send({ status: "Adding engine failed" });
            })
    }).catch(err => {
        console.log(err);
        // Print the message from the engine
        try {
            res.status(500).send({ status: err.response.data.status });
        }
        // If another problem occured, send a default message
        catch (e) {
            console.log(e);
            res.status(500).send({ status: "Can't connect to engine" });
        }
    })
})

router.post('/activate', customMiddleware.isAuthenticated, customMiddleware.isAdmin, async (req, res) => {
    deactivateAppInOldEngine()
        .then(_ => {
            Engine.findByIdAndUpdate(req.body._id, { $set: { listen: true } }).then((engineData) => {
                if (engineData) {
                    let localAgent = new https.Agent({
                        ca: new TextEncoder().encode(engineData.cert)
                    });
                    axios.post(engineData.URI + "/app/activate", {}, { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {
                        res.send({ engineId: engineData._id, status: response.data.status });
                    }).catch(err => {
                        console.log(err.response.data);
                        res.status(400).send({ status: "Something went wrong on the side of the engine" });
                    })
                }
                else {
                    res.status(400).send({ status: "Engine is not registered" })
                }
            }).catch(err => {
                console.log(err);
                res.status(500).send({ status: "Activating the app failed" })
            })
        })
        .catch(err => {
            res.status(400).send({ status: "Deactivating the app in the old engine failed" });
        });
})

router.post('/deactivate', customMiddleware.isAuthenticated, customMiddleware.isAdmin, async (req, res) => {
    deactivateAppInOldEngine().then(status => {
        if (status) {
            res.send({ status: "Engine deactivated" });
        }
        else {
            res.status(500).send({ status: "Deactivation failed" })
        }
    });
})

router.delete('/', customMiddleware.isAuthenticated, customMiddleware.isAdmin, async (req, res) => {
    Engine.findByIdAndRemove(req.body._id).then(engineData => {
        if (engineData) {
            res.send({ status: "Engine deleted" })
        }
        else {
            res.status(400).send({ status: "Engine doesn't exist." });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send({ status: "Deletion failed." });
    })
})

router.get('/status', customMiddleware.isAuthenticated, async (req, res) => {
    getActiveEngine()
        .then(engineData => {
            let localAgent = new https.Agent({
                ca: new TextEncoder().encode(engineData.cert)
            });

            if (engineData) {
                axios.get(engineData.URI + "/app", { httpsAgent: localAgent, headers: { token: engineData.token } })
                    .then(engineResp => {
                        res.send(engineResp.data);
                    })
                    .catch(err => {
                        console.log(err);
                        // Print the message from the engine
                        try {
                            res.status(500).send({ status: err.response.data.status });
                        }
                        // If another problem occured, send a default message
                        catch (e) {
                            res.status(500).send({ status: "Can't connect to engine" });
                        }
                    })
            }
            else {
                res.status(400).send({ status: "Engine is not registered" })
            }
        })
})

router.get('/status/:id', customMiddleware.isAuthenticated, async (req, res) => {
    Engine.findById(req.params.id).then(engineData => {
        if (engineData) {
            let localAgent = new https.Agent({
                ca: new TextEncoder().encode(engineData.cert)
            });

            axios.get(engineData.URI + "/app", { httpsAgent: localAgent, headers: { token: engineData.token } })
                .then(engineResp => {
                    engineResp.rejected = false;
                    res.send(engineResp.data);
                })
                .catch(err => {
                    console.log(err)
                    let appStatus = { active: false, pending: false, rejected: true };
                    res.send(appStatus)
                })
        }
        else {
            res.status(400).send({ status: "Engine is not registered" })
        }
    })
})

router.get('/', customMiddleware.isAuthenticated, async (req, res) => {
    Engine.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        })
})

module.exports = router;
