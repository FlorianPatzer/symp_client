const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const setup = require('./models/setup');
const db = require('./database');
const { ValidationError } = require('express-validation');
const keys = require('./keys');
const https = require('https');
const http = require('http');
const fs = require('fs');
const proxy = require('./misc/proxy')
const router = express.Router();

// Initializations
const app = express();
require('./passport/local-auth');

app.use(express.json());
app.use(cookieParser())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// settings
app.set('port', process.env.PORT || 3000);

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: keys.sessionSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    app.locals.user = req.user;
    next();
});

// Routes
router.use('/', require('./routes/defaultRoutes'))
router.use('/user', require('./routes/userRoutes'));
router.use('/analysis', require('./routes/analysisRoutes'));
router.use('/report', require('./routes/reportRoutes'));
router.use('/settings', require('./routes/settingsRoutes'));
router.use('/engine', require('./routes/engineRoutes'));

// Add globalb prefix
app.use('/backend', router);

// Validation 
app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json(err)
    }
    next()
})

let serverType;
if (process.env.HTTPS == true) {
    console.log("Using HTTPS");
    let privateKey = fs.readFileSync(keys.privateKeyLocation, 'utf8');
    let certificate = fs.readFileSync(keys.certificateLocation, 'utf8');
    let credentials = { key: privateKey, cert: certificate };
    serverType = https.createServer(credentials, app);
}
else {
    console.log("Using HTTP");
    serverType = http.createServer(app);
}

serverType.listen(app.get('port'), async () => {
    db.connectWithRetry(5, 3000)
        .then(() => {
            console.log("Connected to Database")
            setup.createDefaultUsers();
            setup.configureEngineConnection();
            setup.configureSettings().then(_ => {
                proxy.configureProxies(router);
            })
            console.log('Server on port', app.get('port'));
        })
        .catch((err) => {
            console.log(err)
            throw Error('Connection to Database failed');
        })
});
