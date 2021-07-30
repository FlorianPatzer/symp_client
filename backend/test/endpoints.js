let address_prod = "https://localhost/api"
let address_dev = "http://localhost:3000/api"

let address;

if (process.env.DEV) {
    console.log("Testing the dev server at", address_dev)
    address = address_dev
}
else {
    console.log("Testing the prod server at", address_prod)
    address = address_prod
}

module.exports.serverAddress = address