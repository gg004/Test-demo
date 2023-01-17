/**
 * So this file only helps with BAAS service only.
 * We will delete this module on final release.
 * All the project specific endpoints will be in lambda folder
 */
const express = require("express");
let router = express.Router();

const rest = require("./rest");


router = rest(router);

module.exports = router;
