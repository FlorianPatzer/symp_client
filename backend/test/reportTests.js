const expect = require('chai').expect;
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const endpoints = require('./endpoints');
const keys = require('../src/keys');
const fs = require('fs');
const https = require('https');
const jwt = require('jsonwebtoken');
const Engine = require('../src/models/engine')
const { v4: uuidv4 } = require('uuid');
const db = require('../src/database');
const rootAdmin = require('../src/models/default_credentials').root_admin_credentials

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

axios.defaults = Object.assign(axios.defaults, {
  withCredentials: true,
  baseURL: endpoints.serverAddress,
});

let httpsAgent = new https.Agent({
  ca: fs.readFileSync(keys.certificateLocation)
});

let token;
let uuid;
let reportId = "";

function createMockupEngine() {
  return new Promise(resolve => {
    db.connectWithRetry(5, 1000).then(async (connected) => {
      uuid = uuidv4();
      token = jwt.sign({ uuid: uuid }, keys.jwtSecret);
      await Engine.create({ uuid: uuid });
      resolve(connected)
    })
  })
}

function deleteMockupEngine() {
  return new Promise(resolve => {
    Engine.findOneAndDelete({ uuid: uuid })
      .then(data => {
        if (data) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      }).catch(err => {
        resolve(false);
      })
  })
}

describe('Report logic', () => {
  context("Report management", () => {
    context('With engine jwt auth', () => {

      it("Create mockup engine", async () => {
        let status = await createMockupEngine();
        expect(status).to.be.equal(true);
      })

      it("Creating report", async () => {
        let res;
        let errCode;

        try {
          res = await axios.post("/report", {
            forAnalysisName: "mockAnalysisName",
            forAnalysisId: "mockAnalysisId",
            startedAt: new Date(),
            endedAt: new Date(),
            startedBy: "username",
            executedPoliciesCount: 10,
            complieancesCount: 7,
            contradictionsCount: 3,
            output: { some: "data" },
            template: "test-template"
          },
            {
              httpsAgent: httpsAgent,
              jar: cookieJar,
              withCredentials: true,
              headers: { token: token },
            })
        }
        catch (error) {
          res = error.response;;
          errCode = error.response.status;
        }

        reportId = res.data.reportId;
        expect(reportId).to.not.equal(null);
        expect(reportId).to.not.equal(undefined);
      })


      it("Delete mockup engine", async () => {
        let status = await deleteMockupEngine();
        expect(status).to.be.equal(true);
      })
    })

    context('With root admin authentication', () => {
      it("Creating report is not allowed", async () => {
        // Login as root admin, but any registered user is allowed to create analyses
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
          res = await axios.post("/report", {
            forAnalysisName: "mockAnalysisName",
            forAnalysisId: "mockAnalysisId",
            startedAt: new Date(),
            endedAt: new Date(),
            startedBy: "username",
            executedPoliciesCount: 10,
            complieancesCount: 7,
            contradictionsCount: 3,
            output: { some: "data" }
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
        expect(res.data.status).to.equal("Unsufficient rights")
      })

      it('Reading report is allowed', async () => {
        let res;
        let errCode;
        try {
          res = await axios.get("/report/" + reportId,
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

        reportId = res.data._id;
        expect(reportId).to.not.equal(null);
        expect(reportId).to.not.equal(undefined);
      })

      it("Deleting report is allowed", async () => {
        let res;
        let errCode;
        try {
          res = await axios.delete("/report/" + reportId,
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
        await axios.get("/user/logout", { httpsAgent: httpsAgent });
        expect(res.data.reportId).to.not.equal(null);
        expect(res.data.reportId).to.not.equal(undefined);
      })
    })
  })
})

