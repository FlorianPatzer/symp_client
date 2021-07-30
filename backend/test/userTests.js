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

async function loginAsRootAdmin() {
  let res = await axios.post("/user/login", {
    username: rootAdmin.username,
    password: rootAdmin.password
  },
    {
      httpsAgent: httpsAgent,
      jar: cookieJar,
      withCredentials: true,
    });

  return res
}

async function logout() {
  let res = await axios.get("/user/logout", { httpsAgent: httpsAgent })
  return res;
}

describe('User Tests', () => {

  it('Login as root admin and keep session', async () => {
    let res = await loginAsRootAdmin();
    expect(res.data.role).to.be.equal("admin")
  })

  it('Creates a normal user', async () => {
    let res = await axios.post("/user/register", {
      fullName: "Normal User",
      username: "test_user",
      password: "user123@ABC",
      role: 'user'
    },
      {
        httpsAgent: httpsAgent,
        jar: cookieJar,
        withCredentials: true,
      })
    expect(res.data.role).to.be.equal("user")
  })

  it('Creates an admin user', async () => {
    let res = await axios.post("/user/register", {
      fullName: "Test Admin",
      username: "test_admin",
      password: "admin123@ABC",
      role: 'admin'
    },
      {
        httpsAgent: httpsAgent,
        jar: cookieJar,
        withCredentials: true,
      })
    expect(res.data.role).to.be.equal("admin")
  })

  it('Logout root admin', async () => {
    let res = await logout();
    expect(res.data.status).to.be.equal("Logged out");
  })

  it('Login with the new user credentials and keep session', async () => {
    let res = await axios.post("/user/login", {
      username: "test_user",
      password: "user123@ABC"
    },
      {
        httpsAgent: httpsAgent,
        jar: cookieJar,
        withCredentials: true,
      })
    expect(res.data.role).to.be.equal("user")
  })

  it('A user should not be able to register new users', async () => {
    let res;
    try {
      res = await axios.post("/user/register", {}, {
        httpsAgent: httpsAgent,
        jar: cookieJar, // tough.CookieJar or boolean
        withCredentials: true, // If true, send cookie stored in jar
      })
    }
    catch (error) {
      errCode = error.response.status
    }

    expect(errCode).to.be.equal(401)
  })

  it('A user should not be able to change his password with a wrong current one provided', async () => {
    let res;
    let errCode;
    try {
      res = await axios.post("/user/changePassword", {
        password: "wrongCurrentPassword",
        newPassword: "newPassword123@",
      },
        {
          httpsAgent: httpsAgent,
          jar: cookieJar,
          withCredentials: true,
        })
    }
    catch (error) {
      res = error.response
      errCode = error.response.status
    }

    expect(res.data.status).to.be.equal("Wrong Password")
  })

  it('A user should be able to change his password when the current one is provided', async () => {
    let res;

    try {
      res = await axios.post("/user/changePassword", {
        password: "user123@ABC",
        newPassword: "newPassword@123",
      },
        {
          httpsAgent: httpsAgent,
          jar: cookieJar,
          withCredentials: true,
        })
    } catch (error) {
      res = error.response
    }

    expect(res.data.userId).to.not.be.equal(null)
  })

  it('Logout user', async () => {
    let res = await logout();
    expect(res.data.status).to.be.equal("Logged out");
  })

  it('Try login with the new password', async () => {
    let res = await axios.post("/user/login", {
      username: "test_user",
      password: "newPassword@123"
    },
      {
        httpsAgent: httpsAgent,
        jar: cookieJar,
        withCredentials: true,
      })
    expect(res.data.role).to.be.equal("user")
  })

  it('Logout again', async () => {
    let res = await logout();
    expect(res.data.status).to.be.equal("Logged out");
  })

  it('Delete the new user with the root admin rights', async () => {
    await loginAsRootAdmin();

    let username = 'test_user';

    let res = await axios.delete("/user/" + username, {
      httpsAgent: httpsAgent,
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
    })
    expect(res.data.userId).to.not.be.equal(null)

    await logout();
  })

  it('Login with the new admin credentials and keep session', async () => {
    let res = await axios.post("/user/login", {
      username: "test_admin",
      password: "admin123@ABC",
    },
      {
        httpsAgent: httpsAgent,
        jar: cookieJar,
        withCredentials: true,
      })
    expect(res.data.role).to.be.equal("admin")
  })

  it('An admin should be able to register new users', async () => {
    let res = await axios.post("/user/register", {
      fullName: "Test User",
      username: "test_user",
      password: "user123@ABC",
      role: "user"
    }, {
      httpsAgent: httpsAgent,
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
    })
    expect(res.data.role).to.be.equal("user")
  })

  it('Delete the created user', async () => {
    let username = "test_user";
    let res = await axios.delete("/user/" + username, {
      httpsAgent: httpsAgent,
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
    })
    expect(res.data.userId).to.not.be.equal(null)
  })

  it('Logout admin', async () => {
    let res = await logout();
    expect(res.data.status).to.be.equal("Logged out");
  })

  it('Delete the new admin with the root admin rights', async () => {
    await loginAsRootAdmin();
    let username = "test_admin";
    let res = await axios.delete("/user/" + username, {
      httpsAgent: httpsAgent,
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
    })
    expect(res.data.userId).to.not.be.equal(null)
    await logout();
  })

})
