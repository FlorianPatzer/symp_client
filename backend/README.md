# Backend of the SyMP Client

## 1. Overview

The backend is running on NodeJS and is built with:
- Express for fastly exposing server logic on web APIs
- Mongoose for connecting to and editing entries in Mongo DB
- Axios for creating request to CRUD APIs
- Mocha for fast unit tests creation
- And a couple more smaller npm packages that accelerate the development process 


## 2. Getting started

### 2.1 Setting up endpoints and keys:

1. Mongo DB credentials and connection must be edited in **/src/keys.js**
2. The addres of the backend server must be configured in **/test/endpoints.js** in order to run unit tests on the instance
3. Root admin credentials located in **/src/models/setup.js** should also be changed when exposing the app to the world

### 2.2 Running the app in development mode

To run the backend in development mode, follow the steps steps:

1. Navigate to the **/backend** folder
2. Install the needed packages by executing:
    ```
    npm install
    ```
3. Run the app with:
    ```
    DEV=true nodemon src
    ```
4. (Optional) To test the app run:
    ```
    DEV=true npm test
    ```
Note: A running instance of Mongo (respectively a properly configured connection) is needed or every test will fail

## 3. API Description:
The documentation of the REST API is created with the help of [Insomnia](https://insomnia.rest/). The workspace is available as an json file at **/docs/api_insominia_workspace.json** and can be open in the insomnia client and used for direct manual testing.

Alternatively an exported version of the workspace exists as a web-based API documentation at **/docs/Documentation**. To view it, you need to run a web server that hosts the content of the folder. The easiest to do this is to run the following command in the Documentation folder:

```
npx serve
```

*Additional info: The web-based documentation was created with the help of the npm package* **insomnia-documenter**