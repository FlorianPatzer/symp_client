const expect = require('chai').expect;
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const endpoints = require('./endpoints');
const keys = require('../src/keys')
const fs = require('fs')
const https = require('https')

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

axios.defaults = Object.assign(axios.defaults, {
    withCredentials: true,
    baseURL: endpoints.serverAddress,
});

let httpsAgent = new https.Agent({
    ca: fs.readFileSync(keys.certificateLocation)
});

describe('System Tests', () => {
    it('System is started', async () => {
        let res = await axios.get("/",{ httpsAgent: httpsAgent })
        expect(res.status).to.equal(200)
    })
})