const express = require('express'); // Express app
const router = express.Router(); // Router logic
const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens

// This is where we import the controllers we will route
const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');

// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log('Auth Header Required but NOT PRESENT!');
        return res.sendStatus(401);
    }

    const headers = authHeader.split(' ');

    if (headers.length !== 2 || headers[0] !== 'Bearer') {
        console.log('Invalid Authorization Header');
        return res.sendStatus(401);
    }

    const token = headers[1];

    if (!token) {
        console.log('Null Bearer Token');
        return res.sendStatus(401);
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = verified;
        next();
    } catch (err) {
        console.log('Token Validation Error!');
        return res.sendStatus(401);
    }
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.auth) {
            return res.sendStatus(401);
        }

        if (!allowedRoles.includes(req.auth.role)) {
            return res.sendStatus(403);
        }

        next();
    };
}
// Collection routes
router
    .route('/trips')
    .get(tripsController.tripsList)
    .post(authenticateJWT, authorizeRoles('admin', 'editor'), tripsController.tripsAddTrip);

// Individual trip routes
router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, authorizeRoles('admin', 'editor'), tripsController.tripsUpdateTrip)
    .delete(authenticateJWT, authorizeRoles('admin'), tripsController.tripsDeleteTrip);

// Define route for register endpoint
router
    .route('/register')
    .post(authenticateJWT, authorizeRoles('admin'), authController.register);

// Define route for login endpoint
router
    .route('/login')
    .post(authController.login);

module.exports = router;
