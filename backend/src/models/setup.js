const User = require('./user');
const Engine = require('./engine');
const axios = require('axios').default;
const Settings = require('./settings');
const endpoints = require('../endpoints');

let root_admin_credentials = {
    username: "admin",
    password: "admin",
    fullName: "Root Admin",
    role: "admin"
}

function createUser(credentials) {
    User.findOne({ username: credentials.username }).then(async (user) => {
        if (!user) {
            const newUser = new User();
            newUser.username = credentials.username;
            newUser.password = newUser.encryptPassword(credentials.password);
            newUser.role = credentials.role;
            newUser.fullName = credentials.fullName;

            await newUser.save();
        }
    })
}

function createDefaultUsers() {
    createUser(root_admin_credentials);
}

function configureEngineConnection() {
    Engine.findOne({}).then(engine => {
        if (engine) {
            axios.defaults.headers.common['token'] = engine.token;
            endpoints.engineAddress = engine.URI;
        }
        else {
            axios.defaults.headers.common['token'] = "";
            endpoints.engineAddress = "";
        }
    })
}

function configureSettings(){
    return new Promise(resolve=>{
        Settings.findOne({}).then(async (settings)=>{
            if(!settings){
                console.log("Configuring settings");
                const settings = new Settings();
                settings.endpoints.camunda = "";
                settings.endpoints.sme = "";
    
                await settings.save();
            }
            else{
                console.log("Settings found");
            }
            resolve();
        })
    })
}

module.exports.configureSettings = configureSettings 
module.exports.configureEngineConnection = configureEngineConnection
module.exports.createDefaultUsers = createDefaultUsers
module.exports.root_admin_credentials = root_admin_credentials