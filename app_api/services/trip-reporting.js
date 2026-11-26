'use strict';

const Trip = require('../models/travlr');

// Build the MongoDB aggregation pipeline.
function buildResortReportPipeline(resort = null) {
    return [
        // Filter first so MongoDB can consider a resort index.
        ...(resort ? [{ $match: { resort } }] : []),
        // Convert stored string prices into numbers.
        {
            $addFields: {
                numericPrice: {
                    $convert: {
                        input: '$perPerson',
                        to: 'double',
                        onError: null,
                        onNull: null
                    }
                }
            }
        },

        // Group travel packages by resort.
        {
            $group: {
                _id: '$resort',

                tripCount: {
                    $sum: 1
                },

                validPriceCount: {
                    $sum: {
                        $cond: [
                            { $ne: ['$numericPrice', null] },
                            1,
                            0
                        ]
                    }
                },

                averagePrice: {
                    $avg: '$numericPrice'
                },

                minPrice: {
                    $min: '$numericPrice'
                },

                maxPrice: {
                    $max: '$numericPrice'
                }
            }
        },

        // Format the reporting results.
        {
            $project: {
                _id: 0,
                resort: '$_id',
                tripCount: 1,
                validPriceCount: 1,

                excludedPriceCount: {
                    $subtract: [
                        '$tripCount',
                        '$validPriceCount'
                    ]
                },

                averagePrice: {
                    $round: ['$averagePrice', 2]
                },

                minPrice: 1,
                maxPrice: 1
            }
        },

        // Sort resorts alphabetically.
        {
            $sort: {
                resort: 1
            }
        }
    ];
}

// Execute the aggregation against MongoDB.
async function getResortReport(resort = null) {
    return Trip.aggregate(buildResortReportPipeline(resort));
}

module.exports = {
    buildResortReportPipeline,
    getResortReport
};