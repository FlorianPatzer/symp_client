const Engine = require('../models/engine');
const Analysis = require('../models/analysis');
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

function getAnalysisIdInEngine(analysisId) {
    return new Promise((resolve, reject) => {
        Analysis.findById(analysisId)
            .then(analysis => {
                resolve(analysis.id);
            }).catch(err => {
                reject(err);
            });
    })
}

function getAnalysisWithIdInEngine(analysisId) {
    return new Promise((resolve, reject) => {
        Analysis.findOne({ id: analysisId })
            .then(analysis => {
                resolve(analysis)
            }).catch(err => {
                reject(err)
            });
    })
}

function createAnalysisiObject(name, id, createdBy, createdAt, description, targetSystemId, containedPolicies, template, engineURI) {
    let analysis = new Analysis();

    analysis.name = name;
    analysis.id = id;
    analysis.createdBy = createdBy;
    analysis.createdAt = createdAt;
    analysis.description = description;
    analysis.targetSystemId = targetSystemId;
    analysis.containedPolicies = containedPolicies;
    analysis.template = template;
    analysis.engineURI = engineURI;

    return analysis;
}


module.exports.getActiveEngine = getActiveEngine;
module.exports.getAnalysisIdInEngine = getAnalysisIdInEngine;
module.exports.createAnalysisiObject = createAnalysisiObject;
module.exports.getAnalysisWithIdInEngine = getAnalysisWithIdInEngine;