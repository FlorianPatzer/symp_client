## About The Project
Backend of the SyMP Client

### Built With

* [NodeJs](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [Mongoose](https://mongoosejs.com/)
* [Axios](https://axios-http.com/docs/intro)
* [Mocha](https://mochajs.org/)
* and other smaller packages

## Getting Started

### Prerequisites

To run the project in DEV mode, make sure you have the latest version of [NodeJs](https://nodejs.org/en/) installed.

Also make sure that your enviromental variables are setup properly:

1. Mongo DB credentials and connection must be edited in `/src/keys.js` 
2. An env varible `SERVICE_ADDRESS`, pointing to the service's address must be set when starting the backend.
3. Root admin credentials located in `/src/models/setup.js` should also be changed for better security

### Installation

1. Download the repository and install the needed packages by executing the following order in the backend project's directory:
    ```
    npm install
    ```

3. Run the app with:
    ```
    SERVICE_ADDRESS=localhost HTTPS=1 DEV=1 nodemon src
    ```
4. Open https://localhost:3000/backend in your browser and you should see a blank page with the text "SyMP Backend" if the project is started proppely.
 
4. *(Optional)* To test the app run:
    ```
    SERVICE_ADDRESS=localhost HTTPS=0 DEV=1 npm test
    ```
*Note 1: A running instance of Mongo (respectively a properly configured connection) is needed or the server will fail to start*

*Note 2: Running the project withouth the HTTPS env variable set to true will make the server available over HTTP (i.e. make it non secure)*


## Usage

The backend implements OpenAPI specification. A Swagger documentations is available in the `docs/refference` folder in the parrent directory.