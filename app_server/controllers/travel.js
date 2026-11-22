'use strict';

// Existing API endpoints
const tripsEndpoint = "http://localhost:3000/api/trips";
const recommendationsEndpoint = `${tripsEndpoint}/recommendations`;

// Handle customer-facing travel page requests.
const travel = async function (req, res, next) {

    // Read customer preferences from the URL.
    const preferences = {
        destination: typeof req.query.destination === 'string'
            ? req.query.destination.trim() : '',
        budget: typeof req.query.budget === 'string'
            ? req.query.budget.trim() : '',
        days: typeof req.query.days === 'string'
            ? req.query.days.trim() : ''
    };

    // Determine whether the customer entered preferences.
    const hasPreferences = Object.values(preferences).some(Boolean);

    // Use the normal trip API by default.
    let endpoint = tripsEndpoint;

    // When preferences exist, request ranked recommendations.
    if (hasPreferences) {
        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(preferences)) {
            if (value) {
                params.set(key, value);
            }
        }

        endpoint = `${recommendationsEndpoint}?${params.toString()}`;
    }

    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: { Accept: "application/json" }
        });

        const data = await response.json();

        // Handle validation or API errors.
        if (!response.ok) {
            return res.status(response.status).render("travel", {
                title: "Travlr Getaways",
                trips: [],
                message: data.message || "Unable to retrieve trips.",
                preferences,
                hasPreferences
            });
        }

        if (!Array.isArray(data)) {
            throw new Error("Unexpected API response");
        }

        // Display regular trips or ranked recommendations.
        return res.render("travel", {
            title: "Travlr Getaways",
            trips: data,
            preferences,
            hasPreferences,
            message: data.length === 0
                ? "No trips found."
                : null
        });

    } catch (error) {
        console.error("Travel page error:", error.message);

        return res.status(500).render("travel", {
            title: "Travlr Getaways",
            trips: [],
            preferences,
            hasPreferences,
            message: "Unable to load trips."
        });
    }
};

module.exports = { travel };