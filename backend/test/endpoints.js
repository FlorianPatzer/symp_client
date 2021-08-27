let address;

// Setup selfAddress
if (process.env.SERVICE_ADDRESS != undefined || process.env.SERVICE_ADDRESS != null) {
    address = protocol + "://" + process.env.SERVICE_ADDRESS + ":3000/backend"
    console.log("Service address is", process.env.SERVICE_ADDRESS);
}
else {
    throw new Error('SERVICE_ADDRESS env variable is missing');
}

if (process.env.DEV) {
    console.log("Testing the dev server at", address_dev)
    address = address_dev
}
else {
    console.log("Testing the prod server at", address_prod)
    address = address_prod
}

module.exports.serverAddress = address