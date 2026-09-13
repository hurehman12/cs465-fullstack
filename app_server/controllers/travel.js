// Controller for the Travel page

// This function displays the Travel page
const travel = (req, res) => {

  // Render the travel.hbs view
  res.render('travel', {
    title: 'Travlr Getaways'
  });

};

// Export the function so the route can use it
module.exports = {
  travel
};