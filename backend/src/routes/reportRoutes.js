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
    let reportId = req.body.reportId;

    // TODO: Implement token validation and engine check as a middleware
    try {
        let payload = jwt.verify(engineToken, jwtSecret);
        let engineUuid = payload.uuid;

        Engine.findOne({ uuid: engineUuid })
            .then(engineData => {
                let localAgent = new https.Agent({
                    ca: new TextEncoder().encode(engineData.cert)
                });

                axios.get(engineData.URI + "/report/" + reportId, { httpsAgent: localAgent, headers: { token: engineData.token } }).then(async (response) => {

                    let report = new Report();
                    report.id = response.data.id;
                    report.analysis = response.data.analysis;
                    report.startTime = response.data.startTime;
                    report.finishTime = response.data.finishTime;
                    report.policyAnalysisReportSet = response.data.policyAnalysisReportSet;
                    report.engineURI = engineData.URI;

                    report.save()
                        .then(data => {
                            res.send({ reportId: data._id, status: "Report was created successfully" })
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(500).send({ status: "Report creation failed" })
                        });

                }).catch(err => {
                    console.log(err);
                    res.status(500).send({ status: "Retrieving report data from the engine failed." });
                })
            })
            .catch(err => {
                console.log(err);
                res.status(400).send({ status: "Engine is not registered" });
            })

    } catch (err) {
        res.status(400).send({ status: "Bad token" });
    }

})

router.post('/mock', (req, res, next) => {
    let report = new Report();
    report.id = req.body.id;
    report.analysis = req.body.analysis;
    report.startTime = req.body.startTime;
    report.finishTime = req.body.finishTime;
    report.policyAnalysisReportSet = req.body.policyAnalysisReportSet;

    report.save()
        .then(data => {
            res.send({ reportId: data._id, status: "Report was created successfully" })
        })
        .catch(err => {
            console.log(err)
            res.status(500).send({ status: "Report creation failed" })
        });
})

router.delete('/:reportId', customMiddleware.isAuthenticated, async (req, res) => {
    let reportId = req.params.reportId;
    if (mongoose.Types.ObjectId.isValid(reportId)) {
        Report.findOneAndDelete({ _id: reportId }).then(data => {
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
    }
    else {
        res.status(400).send({ status: "Invalid Id" })
    }
})

router.get('/:reportId', customMiddleware.isAuthenticated, async (req, res) => {
    let reportId = req.params.reportId;
    if (mongoose.Types.ObjectId.isValid(reportId)) {
        Report.findOne({ _id: reportId })
            .then(data => res.send(data))
            .catch(err => {
                console.log(err);
                res.status(500).send();
            })
    }
    else {
        res.send({ status: "Invalid Id" })
    }
})

router.get('/', customMiddleware.isAuthenticated, async (req, res) => {
    Report.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        })
})

module.exports = router;