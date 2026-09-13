// Load Express
var express = require('express');

// Create the router
var router = express.Router();

// Load our main controller
var mainController = require('../controllers/main');

/* GET home page */

// When the user visits "/",
// send the request to the index function
// inside the main controller
router.get('/', mainController.index);

// Make this router available to the application
module.exports = router;