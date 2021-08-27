let dbAddress;
let selfAddress;
let certsLocation;
let protocol;

certsLocation = "ssl"

if (process.env.DEV) {
    console.log("Starting in development mode")
    dbAddress = "localhost:27017"
}
else if (process.env.RANCHER) {
    console.log("Starting in rancher mode")
    dbAddress = "symp-mongo:27017"
}
else {
    console.log("Starting in production mode")
    dbAddress = "symp-mongo:27017"
}

// Setup protocol
if (process.env.HTTPS) {
    protocol = "https";
}
else {
    protocol = "http";
}

// Setup selfAddress
if (process.env.SERVICE_ADDRESS != undefined || process.env.SERVICE_ADDRESS != null) {
    selfAddress = protocol + "://" + process.env.SERVICE_ADDRESS + ":3000/backend"
    console.log("Service address is", process.env.SERVICE_ADDRESS);
}
else {
    throw new Error('SERVICE_ADDRESS env variable is missing');
}

module.exports.dbAddress = dbAddress;
module.exports.selfAddress = selfAddress;
module.exports.certsLocation = certsLocation;
