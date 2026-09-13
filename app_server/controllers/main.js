// Controller for the main pages of the website

// Display the home page
const index = (req, res) => {

  // Render the index.hbs view
  res.render('index', {
    title: 'Travlr Getaways'
  });

};

// Allow other files to use the index function
module.exports = {
  index
};