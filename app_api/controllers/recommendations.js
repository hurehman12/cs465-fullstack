'use strict';

const Trip = require('../models/travlr');
const { recommendTrips } = require('../services/trip-recommendations');

// Handle GET requests for recommended trips.
const tripsRecommend = async (req, res) => {
    const { destination, budget, days } = req.query;

    // Require at least one preference.
    if (
        destination === undefined &&
        budget === undefined &&
        days === undefined
    ) {
        return res.status(400).json({
            message: 'Provide a destination, budget, or duration.'
        });
    }

    // Validate destination.
    if (destination !== undefined &&
        (typeof destination !== 'string' ||
         !destination.trim() ||
         destination.length > 100)) {
        return res.status(400).json({
            message: 'Invalid destination.'
        });
    }

    // Validate budget.
    if (budget !== undefined &&
        (typeof budget !== 'string' ||
         !budget.trim() ||
         !Number.isFinite(Number(budget)) ||
         Number(budget) <= 0)) {
        return res.status(400).json({
            message: 'Budget must be a positive number.'
        });
    }

    // Validate duration.
    if (days !== undefined &&
        (typeof days !== 'string' ||
         !Number.isInteger(Number(days)) ||
         Number(days) < 1 ||
         Number(days) > 365)) {
        return res.status(400).json({
            message: 'Duration must be between 1 and 365 days.'
        });
    }

    try {
        // Retrieve available trips from MongoDB.
        const trips = await Trip.find({}).lean().exec();

        // Score trips and select the five best matches.
        const results = recommendTrips(trips, {
            destination,
            budget: budget === undefined ? undefined : Number(budget),
            days: days === undefined ? undefined : Number(days)
        });

        // Return ranked trips with recommendation scores.
        return res.status(200).json(
            results.map(({ trip, score }) => ({
                ...trip,
                recommendationScore: score
            }))
        );

    } catch (error) {
        console.error('Recommendation error:', error);
        return res.status(500).json({
            message: 'Unable to retrieve recommendations.'
        });
    }
};

module.exports = { tripsRecommend };
