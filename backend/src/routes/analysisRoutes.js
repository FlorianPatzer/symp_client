const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const customMiddleware = require("./customMiddleware");
const Analysis = require('../models/analysis');
const User = require('../models/user');
const Settings = require('../models/settings');
const { validate, Joi } = require('express-validation');
const axios = require('axios').default;
const https = require('https');
const helpers = require('../misc/helpers');

const analysisValidation = {
    body: Joi.object({
        _id: Joi.optional(),
        name: Joi.string().required(),
        createdBy: Joi.optional(),
        createdAt: Joi.optional(),
        description: Joi.string().required(),
        targetSystemId: Joi.string().required(),
        template: Joi.string().required(),
        containedPolicies: Joi.array().required(),
        engineURI: Joi.string().required(),
        __v: Joi.optional()
    }),
}

// Check if the passed url is pointing to an external hub or a local one and complete the url if so
function checkOrCreatePolicyUrl(clientUrl) {
    return new Promise((resolve, reject) => {
        let outputUrl = "";
        try {
            new URL(clientUrl);
            outputUrl = clientUrl;
            console.log("Using external analysis hub address");
            resolve(outputUrl);
        } catch (e) {
            Settings.findOne({})
                .then(settings => {
                    let defaultHubUrl = settings.endpoints.ah;
                    console.log("Using local analysis hub address");

                    // Remove trailing slash if there is one present in the base url
                    if (defaultHubUrl.slice(-1) == "/") {
                        defaultHubUrl = defaultHubUrl.substr(0, defaultHubUrl.length);
                    }

                    // Create the URL
                    if (clientUrl.slice(0, 1) == "/") {
                        outputUrl = defaultHubUrl + clientUrl;
                    }
                    else {
                        outputUrl = defaultHubUrl + "/" + clientUrl;
                    }

                    console.log("Policy URL is: " + outputUrl);

                    resolve(outputUrl);
                })
                .catch(err => reject(err))
        }
    })
}


router.post('/', customMiddleware.isAuthenticated, validate(analysisValidation), (req, res, next) => {
    let userId = req.session.passport.user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
        User.findOne({ _id: userId })
            .then(user => {
                let analysis = new Analysis();

                analysis.name = req.body.name;
                analysis.createdBy = user.fullName;
                analysis.createdAt = new Date();
                analysis.description = req.body.description;
                analysis.targetSystemId = req.body.targetSystemId;
                analysis.containedPolicies = req.body.containedPolicies;
                analysis.template = req.body.template;
                analysis.engineURI = req.body.engineURI;

                let dataForSAE = {
                    uuid: "",
                    name: analysis.name,
                    description: req.body.description,
                    targetSystemId: req.body.targetSystemId,
                    policyAnalyses: req.body.containedPolicies
                };

                helpers.getActiveEngine().then(engineData => {
                    if (engineData) {
                        let localAgent = new https.Agent({
                            ca: new TextEncoder().encode(engineData.cert)
                        });

                        analysis.save()
                            .then(analysisData => {
                                dataForSAE.uuid = analysisData._id;

                                axios.post(engineData.URI + "/analysis", dataForSAE, { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {
                                    res.send({ analysisId: analysisData._id, status: "Analysis was created successfully" });
                                }).catch(err => {
                                    console.log(err);
                                    analysis.delete();
                                    res.status(400).send({ analysisId: analysisData._id, status: "Analysis can't be created. Check backend log for more information." });
                                })
                            })
                            .catch(err => {
                                res.status(400).send({ analysisId: null, status: "Analysis creation failed" });
                            })
                    }
                    else {
                        res.status(400).send({ analysisId: data._id, status: "Analysis can't be created. There is no active engine" });
                    }
                })

            }).catch(err => {
                res.status(400).send({ status: "User not found" })
            });
    }
    else {
        res.status(500).send({ status: "Invalid user" });
    }
})

router.delete('/:analysisId', customMiddleware.isAuthenticated, async (req, res) => {
    let analysisId = req.params.analysisId;
    if (mongoose.Types.ObjectId.isValid(analysisId)) {
        Analysis.findOneAndDelete({ _id: analysisId }).then(data => {
            if (data) {
                res.send({ analysisId: data._id, status: "Analysis deleted" });
            }
            else {
                res.status(400).send({ status: "Analysis deletion failed" });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).send({ status: "Analysis deletion failed" });
        })
    }
    else {
        res.status(400).send({ status: "Invalid Id" });
    }
})

router.put('/', customMiddleware.isAuthenticated, validate(analysisValidation), async (req, res) => {
    let newAnalysis = req.body;
    if (mongoose.Types.ObjectId.isValid(newAnalysis._id)) {

        helpers.getActiveEngine().then(engineData => {
            if (engineData) {
                let localAgent = new https.Agent({
                    ca: new TextEncoder().encode(engineData.cert)
                });

                Analysis.findByIdAndUpdate(newAnalysis._id, newAnalysis)
                    .then(analysis => {
                        if (analysis) {

                            let dataForSAE = {
                                uuid: newAnalysis._id,
                                name: newAnalysis.name,
                                description: newAnalysis.description,
                                targetSystemId: newAnalysis.targetSystemId,
                                policyAnalyses: newAnalysis.containedPolicies
                            };

                            axios.patch(engineData.URI + "/analysis", dataForSAE, { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {
                                res.send({ analysisId: analysis._id, status: "Analysis was updated successfully" });
                            }).catch(err => {
                                console.log(err.response);
                                res.status(400).send({ analysisId: analysis._id, status: "Analysis can't be updated. Check backend log for more information." });
                            })
                        }
                        else {
                            res.status(400).send({ status: "Analysis update failed" });
                        }
                    }).catch(err => {
                        console.log(err);
                        res.status(500).send({ status: "Analysis update failed" });
                    })

            }
            else {
                res.status(400).send({ analysisId: data._id, status: "Analysis can't be updated. There is no active engine" });
            }
        })
    }
    else {
        res.status(500).send({ status: "Invalid Id" });
    }
})

router.get('/:analysisId', customMiddleware.isAuthenticated, async (req, res) => {
    let analysisId = req.params.analysisId;

    if (mongoose.Types.ObjectId.isValid(analysisId)) {
        Analysis.findOne({ _id: analysisId })
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({ status: "Something went wrong. Check backend logs." });
            })
    }
    else {
        res.status(400).send({ status: "Invalid Id" });
    }
})

router.get('/status/:analysisId', customMiddleware.isAuthenticated, async (req, res) => {
    let analysisId = req.params.analysisId;

    if (mongoose.Types.ObjectId.isValid(analysisId)) {

        helpers.getActiveEngine().then(engineData => {
            if (engineData) {
                let localAgent = new https.Agent({
                    ca: new TextEncoder().encode(engineData.cert)
                });

                axios.get(engineData.URI + "/analysis/" + analysisId + "/status", { httpsAgent: localAgent, headers: { token: engineData.token } })
                    .then(async (response) => {
                        res.send(response.data);
                    }).catch(err => {
                        console.log(err.response);
                        res.status(400).send({ status: "Something went wrong. Check backend logs." });
                    });

            }
            else {
                res.status(400).send({ status: "There is no active engine" });
            }
        })
    }
    else {
        res.status(400).send({ status: "Invalid Id" });
    }
})

router.get('/', customMiddleware.isAuthenticated, async (req, res) => {
    Analysis.find({})
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        })
})

router.post('/start/:analysisId', customMiddleware.isAuthenticated, async (req, res) => {
    let analysisId = req.params.analysisId;
    let metadata = req.body.metadata;

    if (mongoose.Types.ObjectId.isValid(analysisId)) {

        // TODO: Combine the analysis data and the user metadata 
        // TODO: Send the data to the analysis engine and initiate anlysis start
        // TODO: Return information to the frontend about the operation

        helpers.getActiveEngine().then(engineData => {
            if (engineData) {
                let localAgent = new https.Agent({
                    ca: new TextEncoder().encode(engineData.cert)
                });

                axios.post(engineData.URI + "/analysis/" + analysisId + "/start/", {}, { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {
                    res.send(response.data);
                }).catch(err => {
                    console.log(err);
                    res.status(400).send({ status: "Analysis start failed. Check backend log for more information." });
                })
            }
            else {
                res.status(400).send({ status: "There is no active engine" });
            }
        })
    }
    else {
        res.status(400).send({ status: "Invalid Id" });
    }
})

router.post('/hub/policy/', customMiddleware.isAuthenticated, async (req, res) => {
    checkOrCreatePolicyUrl(req.body.url)
        .then(policyUrl => {
            axios.get(policyUrl).then(response => {
                let dataForClient = response.data;
                dataForClient.policyUrl = policyUrl;
                res.send(dataForClient);
            }).catch(err => {
                console.log(err)
                res.status(400).send({ status: "Bad Policy Url" });
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).send({ status: "Policy Url Checked Failed" });
        })
})

module.exports = router;