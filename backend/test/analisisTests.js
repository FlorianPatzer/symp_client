const expect = require('chai').expect;
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const endpoints = require('./endpoints');
const rootAdmin = require('../src/models/default_credentials').root_admin_credentials
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

describe('Analysis logic', () => {
  context("Analisis management", () => {
    context('Without user authentication', () => {
      it("Creating analysis is not allowed", async () => {
        let res;
        let errCode;
        try {
          res = await axios.post("/analysis", {
            name: "Test analysis",
            description: "Test description",
            targetSystem: "Test system",
            containedPolicies: ["id1", "id2", "id3"]
          }, { httpsAgent: httpsAgent })
        }
        catch (error) {
          res = error.response;;
          errCode = error.response.status;
        }
        
        expect(res.data.status).to.equal("Not authorized")
      })

      it("Update analysis not allowed", async () => {
        let res;
        let errCode;
        try {
          res = await axios.put("/analysis", {
            name: "New name",
            description: "New description",
            targetSystem: "Test system",
            containedPolicies: ["id1", "id2", "id3", "id4"]
          }, { httpsAgent: httpsAgent })
        }
        catch (error) {
          res = error.response;;
          errCode = error.response.status;
        }

        expect(res.data.status).to.equal("Not authorized")
      })

      it("Deleting analysis is not allowed", async () => {
        let res;
        let errCode;
        try {
          res = await axios.delete("/analysis/123", { httpsAgent: httpsAgent })
        }
        catch (error) {
          res = error.response;;
          errCode = error.response.status;
        }
        expect(res.data.status).to.equal("Not authorized")
      })
    })

    context('With user authentication', () => {

      let analysisId = "";

      it("Creating analysis is allowed", async () => {
        await axios.post("/user/login", {
          username: rootAdmin.username,
          password: rootAdmin.password,
        },
          {
            httpsAgent: httpsAgent,
            jar: cookieJar,
            withCredentials: true,
          });

        let res;
        let errCode;
        try {
          res = await axios.post("/analysis", {
            name: "Test analysis",
            description: "Test description",
            targetSystem: "Test system",
            containedPolicies: ["id1", "id2", "id3"],
            template: "test-template",
            engineURI:"https://yourEngineHere"
          },
            {
              httpsAgent: httpsAgent,
              jar: cookieJar,
              withCredentials: true,
            })
        }
        catch (error) {
          res = error.response;;
          errCode = error.response.status;
        }

        analysisId = res.data.analysisId;
        expect(analysisId).to.not.equal(null)
        expect(analysisId).to.not.equal(undefined)
      })

      it("Update analysis is allowed", async () => {
        let res;
        let errCode;
        try {
          res = await axios.put("/analysis", {
            _id: analysisId,
            name: "New name",
            description: "New description",
            targetSystem: "Test system",
            containedPolicies: ["id1", "id2", "id3", "id4"],
            template:"test-template",
            engineURI:"https://yourEngineHere"
          },
            {
              httpsAgent: httpsAgent,
              jar: cookieJar,
              withCredentials: true,
            })
        }
        catch (error) {
          res = error.response;
        }
        expect(res.data.analysisId).to.not.equal(null)

        try {
          res = await axios.get("/analysis/" + analysisId,
            {
              httpsAgent: httpsAgent,
              jar: cookieJar,
              withCredentials: true,
            })
        }
        catch (error) {
          res = error.response;
        }

        expect(res.data.name).to.equal("New name")
        expect(res.data.description).to.equal("New description")
        expect(res.data.containedPolicies).to.contain("id4")
      })

      it("Deleting analysis is allowed", async () => {
        let res;
        let errCode;
        try {
          res = await axios.delete("/analysis/" + analysisId,
            {
              httpsAgent: httpsAgent,
              jar: cookieJar,
              withCredentials: true,
            })
        }
        catch (error) {
          res = error.response;;
          errCode = error.response.status;
        }
        expect(res.data.analysisId).to.not.equal(null)
      })

    })
  })
})