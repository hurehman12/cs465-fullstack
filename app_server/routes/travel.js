// Load Express
var express = require('express');

// Create a router
var router = express.Router();

// Load the Travel controller
var travelController = require('../controllers/travel');

/* GET Travel page */

// When the user visits the Travel route,
// send the request to the Travel controller
router.get('/', travelController.travel);

// Export the router so app.js can use it
module.exports = router;