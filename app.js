// Load required packages

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Load Handlebars
var hbs = require('hbs');


// Load the website routes

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');
var travelRouter = require('./app_server/routes/travel');


// Create the Express application

var app = express();


// ------------------------------------
// View Engine Setup
// ------------------------------------

// Tell Express where our Handlebars views are located
app.set('views', path.join(__dirname, 'app_server', 'views'));

// Tell Express to use Handlebars (.hbs)
app.set('view engine', 'hbs');

// Register the partials folder so Handlebars
// can use {{> header }} and {{> footer }}
hbs.registerPartials(
  path.join(__dirname, 'app_server', 'views', 'partials')
);


// ------------------------------------
// Middleware
// ------------------------------------

app.use(logger('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// Allow Express to serve files from the public folder
// This includes images, CSS, and static HTML files
app.use(express.static(path.join(__dirname, 'public')));


// ------------------------------------
// Routes
// ------------------------------------

// Home page
app.use('/', indexRouter);

// Users route
app.use('/users', usersRouter);

// Travel page
app.use('/travel', travelRouter);


// ------------------------------------
// Error Handling
// ------------------------------------

// Catch a 404 error if a page cannot be found
app.use(function(req, res, next) {
  next(createError(404));
});


// Handle application errors
app.use(function(err, req, res, next) {

  // Make the error message available to the view
  res.locals.message = err.message;

  // Only show detailed errors while developing
  res.locals.error =
    req.app.get('env') === 'development' ? err : {};

  // Set the HTTP error status
  res.status(err.status || 500);

  // Display the error page
  res.render('error');
});


// Export the Express application

module.exports = app;