const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const customMiddleware = require("./customMiddleware");
const Report = require('../models/report');
const Engine = require('../models/engine');
const { validate, Joi } = require('express-validation');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../keys').jwtSecret;
const helpers = require('../misc/helpers');
const https = require('https');
const axios = require('axios').default;
const { type } = require('os');

const reportValidation = {
    body: Joi.object({
        forAnalysisName: Joi.string().required(),
        forAnalysisId: Joi.string().required(),
        startedAt: Joi.date().required(),
        endedAt: Joi.date().required(),
        startedBy: Joi.string().required(),
        executedPoliciesCount: Joi.number().required(),
        complieancesCount: Joi.number().required(),
        contradictionsCount: Joi.number().required(),
        template: Joi.string().required(),
        output: Joi.object().required(),
    })
}

//validate(reportValidation),
router.post('/', (req, res, next) => {
    let engineToken = req.headers.token;

    // TODO: Implement token validation and engine check as a middleware
    try {
        let payload = jwt.verify(engineToken, jwtSecret);
        let engineUuid = payload.uuid;

        Engine.findOne({ uuid: engineUuid })
            .then(engineData => {

                let report = new Report();
                report.id = req.body.reportId;
                report.analysisId = req.body.analysisId;
                report.engineURI = engineData.URI;
                report.createdAt = new Date();

                report.save()
                    .then(data => {
                        res.send({ reportId: data._id, status: "Report was created successfully" })
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).send({ status: "Report creation failed" })
                    });
            })
            .catch(err => {
                console.log(err);
                res.status(400).send({ status: "Engine is not registered" });
            })

    } catch (err) {
        res.status(400).send({ status: "Bad token" });
    }

})

router.delete('/:reportId', customMiddleware.isAuthenticated, async (req, res) => {
    let reportId = req.params.reportId;

    Report.findOneAndDelete({ id: reportId }).then(data => {
        if (data) {
            res.send({ reportId: data._id, status: "Report deleted" })
        }
        else {
            res.status(400).send({ status: "Report deletion failed" })
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send({ status: "Report deletion failed" })
    })

})

router.get('/:reportId', customMiddleware.isAuthenticated, async (req, res) => {
    let reqFromEngine = req.query.engine;
    let reportId = req.params.reportId;

    Report.findOne({ id: reportId })
        .then(report => {
            if (reqFromEngine) {
                helpers.getActiveEngine()
                    .then(engineData => {
                        let localAgent = new https.Agent({
                            ca: new TextEncoder().encode(engineData.cert)
                        });

                        axios.get(report.engineURI + "/report/" + reportId, { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {
                            res.send(response.data);
                        }).catch(err => {
                            console.log(err);
                            res.status(500).send({ status: "Retrieving report data from the engine failed." });
                        });
                    });
            }
            else {
                res.send(report);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        });
})

router.get('/', async (req, res) => {
    let reqFromEngine = req.query.engine;
    if (reqFromEngine) {
        helpers.getActiveEngine()
            .then(engineData => {
                let localAgent = new https.Agent({
                    ca: new TextEncoder().encode(engineData.cert)
                });

                axios.get(engineData.URI + "/report", { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {
                    res.send(response.data);
                }).catch(err => {
                    console.log(err);
                    res.status(500).send({ status: "Retrieving report data from the engine failed." });
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).send();
            })
    }
    else {
        Report.find({})
            .then(reports => {
                res.send(reports);
            })
            .catch(err => {
                console.log(err);
                res.status(500).send();
            })

    }
})

module.exports = router;