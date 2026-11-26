'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');

const {
    buildResortReportPipeline
} = require('../app_api/services/trip-reporting');

let connection;
let collection;
const collectionName = 'resort_test_' + randomUUID().replace(/-/g, '');

before(async () => {
    // Use a separate database, not the application's travlr database.
    connection = await mongoose.createConnection(
        'mongodb://127.0.0.1:27017/travlr_cs499_reporting_test',
        { autoIndex: false, autoCreate: false }
    ).asPromise();

    collection = connection.db.collection(collectionName);

    await collection.insertMany([
        { resort: 'Blue Lagoon', perPerson: '800.00' },
        { resort: 'Blue Lagoon', perPerson: '1000.00' },
        { resort: 'Blue Lagoon', perPerson: '1200.00' },
        { resort: 'Coral Sands', perPerson: '500.00' },
        { resort: 'Coral Sands', perPerson: 'invalid' },
        { resort: 'Invalid Prices', perPerson: 'unknown' },
        { resort: 'Invalid Prices', perPerson: '' }
    ]);
});

after(async () => {
    try {
        if (collection) {
            await collection.drop();
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

async function getReport() {
    return collection.aggregate(
        buildResortReportPipeline()
    ).toArray();
}

// Test 1
test('groups trips correctly by resort', async () => {
    const results = await getReport();

    assert.equal(results.length, 3);

    const blue = results.find(r => r.resort === 'Blue Lagoon');
    const coral = results.find(r => r.resort === 'Coral Sands');

    assert.equal(blue.tripCount, 3);
    assert.equal(coral.tripCount, 2);
});

// Test 2
test('calculates average trip prices correctly', async () => {
    const results = await getReport();
    const blue = results.find(r => r.resort === 'Blue Lagoon');

    assert.equal(blue.averagePrice, 1000);
});

// Test 3
test('calculates minimum and maximum prices', async () => {
    const results = await getReport();
    const blue = results.find(r => r.resort === 'Blue Lagoon');

    assert.equal(blue.minPrice, 800);
    assert.equal(blue.maxPrice, 1200);
});

// Test 4
test('excludes invalid prices from calculations', async () => {
    const results = await getReport();
    const coral = results.find(r => r.resort === 'Coral Sands');

    assert.equal(coral.tripCount, 2);
    assert.equal(coral.validPriceCount, 1);
    assert.equal(coral.excludedPriceCount, 1);
    assert.equal(coral.averagePrice, 500);
});

// Test 5
test('handles resorts with no valid prices', async () => {
    const results = await getReport();
    const invalid = results.find(r => r.resort === 'Invalid Prices');

    assert.equal(invalid.tripCount, 2);
    assert.equal(invalid.validPriceCount, 0);
    assert.equal(invalid.excludedPriceCount, 2);
    assert.equal(invalid.averagePrice, null);
    assert.equal(invalid.minPrice, null);
    assert.equal(invalid.maxPrice, null);
});

// Test 6
test('returns an empty report when no records match', async () => {
    const results = await collection.aggregate([
        { $match: { resort: 'Nonexistent Resort' } },
        ...buildResortReportPipeline()
    ]).toArray();

    assert.deepEqual(results, []);
});

test('filters the reporting pipeline to one exact resort', async () => {
    const results = await collection.aggregate(
        buildResortReportPipeline('Blue Lagoon')
    ).toArray();

    assert.equal(results.length, 1);
    assert.equal(results[0].resort, 'Blue Lagoon');
    assert.equal(results[0].tripCount, 3);
    assert.equal(results[0].averagePrice, 1000);
});

test('returns empty results for an unknown resort filter', async () => {
    const results = await collection.aggregate(
        buildResortReportPipeline('Unknown Resort')
    ).toArray();

    assert.deepEqual(results, []);
});

test('places the resort match before aggregation calculations', () => {
    const pipeline = buildResortReportPipeline('Blue Lagoon');

    assert.deepEqual(
        pipeline[0],
        { $match: { resort: 'Blue Lagoon' } }
    );

    const unfiltered = buildResortReportPipeline();

    assert.ok(unfiltered[0].$addFields);
});
