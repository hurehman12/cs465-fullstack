'use strict';

const {
    getResortReport
} = require('../services/trip-reporting');

// GET /api/reports/resorts
// Optional query parameter: ?resort=Blue Lagoon, 4 stars
// Administrator authorization is enforced by the API route.
const resortSummary = async (req, res) => {

    const requestedResort = req.query.resort;

    // Validate an optional resort filter.
    if (requestedResort !== undefined) {

        if (
            typeof requestedResort !== 'string' ||
            !requestedResort.trim() ||
            requestedResort.trim().length > 100
        ) {
            return res.status(400).json({
                message: 'Invalid resort filter.'
            });
        }
    }

    try {
        // Use an exact resort match when provided.
        const resort = requestedResort === undefined
            ? null
            : requestedResort.trim();

        // Execute MongoDB aggregation.
        const report = await getResortReport(resort);

        return res.status(200).json(report);

    } catch (error) {
        console.error('Resort reporting error:', error);

        return res.status(500).json({
            message: 'Unable to generate resort report.'
        });
    }
};

module.exports = {
    resortSummary
};