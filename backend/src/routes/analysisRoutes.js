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
                let analysisRequest = req.body;

                let dataForSAE = {
                    name: analysisRequest.name,
                    description: analysisRequest.description,
                    targetSystemId: analysisRequest.targetSystemId,
                    policyAnalyses: analysisRequest.containedPolicies
                };

                helpers.getActiveEngine().then(engineData => {
                    if (engineData) {
                        let localAgent = new https.Agent({
                            ca: new TextEncoder().encode(engineData.cert)
                        });

                        axios.post(engineData.URI + "/analysis", dataForSAE, { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {
                            let analysis = helpers.createAnalysisiObject(analysisRequest.name, response.data.analysisId, user.fullName, new Date(), analysisRequest.description, analysisRequest.targetSystemId, analysisRequest.containedPolicies, analysisRequest.template, analysisRequest.engineURI);

                            analysis.save()
                                .then(analysisData => {
                                    res.send({ analysisId: response.data.analysisId, status: "Analysis was created successfully" });
                                })
                                .catch(err => {
                                    res.status(400).send({ analysisId: null, status: "Analysis creation failed" });
                                });

                        }).catch(err => {
                            let statusCode = err.response.status;
                            if (statusCode == 409) {
                                let responseData = err.response.data;
                                res.status(409).send({ analysisId: responseData.analysisId, status: responseData.status });
                            }
                            else {
                                console.log(err);
                                res.status(400).send({ analysisId: null, status: "Analysis can't be created. Check backend log for more information." });
                            }
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

    Analysis.findOneAndDelete({ id: analysisId })
        .then(data => {
            if (data) {
                helpers.getActiveEngine().then(engineData => {
                    if (engineData) {
                        let localAgent = new https.Agent({
                            ca: new TextEncoder().encode(engineData.cert)
                        });

                        axios.post(engineData.URI + "/analysis/" + analysisId + "/unsubscribe", {}, { httpsAgent: localAgent, headers: { token: engineData.token } })
                            .then(async (response) => {
                                res.send({ analysisId: data.id, status: "Unsubscribed and deleted locally" });
                            }).catch(err => {
                                console.log(err);
                                res.status(400).send({ status: "Check backend log for more information." });
                            })

                    }
                    else {
                        res.status(400).send({ status: "Analysis can't be deleted. There is no active engine" });
                    }
                });
            }
            else {
                res.status(400).send({ status: "Analysis deletion failed" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({ status: "Analysis deletion failed" });
        });
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
                                res.send({ analysisId: response.data.analysisId, status: "Analysis was updated successfully" });
                            }).catch(err => {
                                console.log(err.response);
                                res.status(400).send({ analysisId: null, status: "Analysis can't be updated. Check backend log for more information." });
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
                res.status(400).send({ analysisId: null, status: "Analysis can't be updated. There is no active engine" });
            }
        })
    }
    else {
        res.status(500).send({ status: "Invalid Id" });
    }
})

router.get('/:analysisId', customMiddleware.isAuthenticated, async (req, res) => {
    let analysisId = req.params.analysisId;

    Analysis.findOne({ id: analysisId })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({ status: "Something went wrong. Check backend logs." });
        })

})

router.get('/status/:analysisId', customMiddleware.isAuthenticated, async (req, res) => {
    let analysisId = req.params.analysisId;


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

})

router.get('/', customMiddleware.isAuthenticated, async (req, res) => {

    Analysis.find({})
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        });
})

router.post('/start/:analysisId', customMiddleware.isAuthenticated, async (req, res) => {
    let analysisId = req.params.analysisId;
    let metadata = req.body.metadata;

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
    });
})

router.post('/subscribe/:analysisId', customMiddleware.isAuthenticated, async (req, res) => {
    let analysisId = req.params.analysisId;

    helpers.getActiveEngine().then(engineData => {
        if (engineData) {
            let localAgent = new https.Agent({
                ca: new TextEncoder().encode(engineData.cert)
            });

            axios.post(engineData.URI + "/analysis/" + analysisId + "/subscribe", {}, { httpsAgent: localAgent, headers: { token: engineData.token } })
                .then(async (response) => {
                    let analysisResponse = JSON.parse(response.data.analysis);

                    // Let's check if we are already subscribed to this analyisis and skip subscribing a second time if this is the case
                    helpers.getAnalysisWithIdInEngine(analysisId).then(analysisResult => {
                        if (analysisResult) {
                            console.log("Already subscribed to this analysis");
                            res.send({ analysisId: analysisId, status: "You are already a subscribed." });
                        }
                        else {
                            // Here we extract the policy urls from the policy data, because the SAE returns more information than needed
                            let analysisPolicies = analysisResponse.policyAnalyses;
                            let extractedPolyURLs = [];
                            analysisPolicies.forEach(policy => {
                                // This points to the model of the policy in the AH
                                let policyModelUrl = policy.link;

                                // We want to save the URL to the policy in the AH, not the model
                                // That's we cut the string here (we remove the '/model' part from the model link)
                                let policyUrl = policyModelUrl.substring(0, policyModelUrl.lastIndexOf('/'));

                                extractedPolyURLs.push(policyUrl);
                            });

                            let analysis = helpers.createAnalysisiObject(analysisResponse.name, analysisId, "External User", new Date(), analysisResponse.description, analysisResponse.targetSystem, extractedPolyURLs, "plain-data", engineData.URI);

                            analysis.save()
                                .then(analysisData => {
                                    res.send({ analysisId: analysisId, status: "Subscribed successfully" });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(400).send({ analysisId: null, status: "Analysis subscription failed" });
                                });
                        }
                    }).catch(err => {
                        console.log(err);
                        res.status(500)
                            .send({ status: "Check backend log for more information." });
                    })

                }).catch(err => {
                    console.log(err);
                    res.status(400)
                        .send({ status: "Analysis reading failed. Check backend log for more information." });
                });
        }
        else {
            res.status(400)
                .send({ analysisId: analysisId, status: "Analysis data can't be accessed. There is no active engine" });
        }
    });
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
            res.status(500).send({ status: "Policy Url Check Failed" });
        })
})

module.exports = router;