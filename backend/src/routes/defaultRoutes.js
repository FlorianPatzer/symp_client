const express = require('express');
const router = express.Router();
const customMiddleware = require("./customMiddleware")

router.get('/', (req, res, next) => {
    res.send("SyMP Backend")
});

module.exports = router;