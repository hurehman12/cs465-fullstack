// Controller for the Travel page

// Load the file system package so we can read the JSON file
var fs = require('fs');

// Read the trip data from trips.json
var trips = JSON.parse(
  fs.readFileSync('./data/trips.json', 'utf8')
);

// This function displays the Travel page
const travel = (req, res) => {

  // Render travel.hbs and send the trip data to the view
  res.render('travel', {
    title: 'Travlr Getaways',
    trips: trips
  });

};

// Export the function so the route can use it
module.exports = {
  travel
};