'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    parsePrice,
    parseDays,
    scoreTrip,
    recommendTrips
} = require('../app_api/services/trip-recommendations');

const trips = require('../data/trips.json');

const preferences = {
    destination: 'Blue Lagoon',
    budget: 900,
    days: 5
};

// Test 1: Convert stored prices to numbers.
test('converts trip prices correctly', () => {
    assert.equal(parsePrice('799.00'), 799);
    assert.equal(parsePrice('$1,099.00'), 1099);
    assert.equal(parsePrice('invalid'), null);
    assert.equal(parsePrice(''), null);
});

// Test 2: Extract trip duration from text.
test('extracts trip duration correctly', () => {
    assert.equal(parseDays('4 nights / 5 days'), 5);
    assert.equal(parseDays('7 days'), 7);
    assert.equal(parseDays('unknown'), null);
});

// Test 3: Verify a perfect recommendation.
test('assigns 100 points to a perfect match', () => {
    const score = scoreTrip(trips[1], preferences);
    assert.equal(score, 100);
});

// Test 4: Verify partial matches.
test('calculates partial matching scores', () => {
    assert.equal(scoreTrip(trips[0], preferences), 50);
    assert.equal(scoreTrip(trips[2], preferences), 20);
});

// Test 5: Verify duration scoring.
test('awards partial points for nearby durations', () => {
    const score = scoreTrip(trips[0], { days: 4 });
    assert.equal(score, 15);
});

// Test 6: Verify recommendation ordering.
test('ranks sample trips from highest to lowest', () => {
    const results = recommendTrips(trips, preferences);

    assert.deepEqual(
        results.map(result => result.score),
        [100, 50, 20]
    );
});

// Test 7: Support fewer than five trips.
test('returns available trips when fewer than five exist', () => {
    const results = recommendTrips(trips, preferences, 5);
    assert.equal(results.length, 3);
});

// Test 8: Enforce the requested result limit.
test('limits recommendations to the requested count', () => {
    const results = recommendTrips(trips, preferences, 2);

    assert.equal(results.length, 2);
    assert.equal(results[0].trip.name, "Dawson's Reef");
});

// Test 9: Handle empty datasets.
test('handles an empty trip dataset', () => {
    assert.deepEqual(recommendTrips([], preferences), []);
});

// Test 10: Validate the result limit.
test('rejects invalid recommendation limits', () => {
    assert.throws(
        () => recommendTrips(trips, preferences, 0),
        RangeError
    );
});

// Test 11: Ensure consistent tie-breaking.
test('ranks equal scores consistently by trip code', () => {
    const equalTrips = ['B', 'C', 'A'].map(code => ({
        ...trips[0],
        code
    }));

    const results = recommendTrips(equalTrips, {}, 2);

    assert.deepEqual(
        results.map(result => result.trip.code),
        ['A', 'B']
    );
});

// Test 12: Compare heap selection against full sorting.
test('min-heap matches full sorting for 500 trips', () => {
    const generatedTrips = [];

    for (let i = 0; i < 500; i++) {
        generatedTrips.push({
            ...trips[i % trips.length],
            code: `TEST${String(i).padStart(4, '0')}`,
            perPerson: String(400 + (i * 37) % 950),
            length: `${i % 9 + 1} days`
        });
    }

    const heapResults = recommendTrips(
        generatedTrips,
        preferences,
        5
    );

    const sortedResults = generatedTrips
        .map(trip => ({
            trip,
            score: scoreTrip(trip, preferences)
        }))
        .sort((a, b) =>
            b.score - a.score ||
            a.trip.code.localeCompare(b.trip.code)
        )
        .slice(0, 5);

    assert.deepEqual(
        heapResults.map(result => result.trip.code),
        sortedResults.map(result => result.trip.code)
    );
});
