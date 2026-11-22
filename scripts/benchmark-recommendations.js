'use strict';

const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');

const {
    scoreTrip,
    recommendTrips
} = require('../app_api/services/trip-recommendations');

const originalTrips = require('../data/trips.json');

const preferences = {
    destination: 'Blue Lagoon',
    budget: 900,
    days: 5
};

// Generate reproducible test data.
function generateTrips(count) {
    const resorts = [
        'Blue Lagoon, 4 stars',
        'Emerald Bay, 3 stars',
        'Coral Sands, 5 stars'
    ];

    return Array.from({ length: count }, (_, i) => ({
        ...originalTrips[i % originalTrips.length],
        code: `BENCH${String(i).padStart(7, '0')}`,
        resort: resorts[i % resorts.length],
        perPerson: String(450 + (i * 37) % 1200),
        length: `${3 + (i % 9)} days`
    }));
}

// Baseline: score and sort every trip.
function fullSort(trips) {
    return trips
        .map(trip => ({
            trip,
            score: scoreTrip(trip, preferences)
        }))
        .sort((a, b) =>
            b.score - a.score ||
            a.trip.code.localeCompare(b.trip.code)
        )
        .slice(0, 5);
}

// Run repeated measurements and return the median.
function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function benchmark(trips) {
    const heapFn = () => recommendTrips(trips, preferences, 5);
    const sortFn = () => fullSort(trips);

    // Verify both algorithms select the same five trips.
    assert.deepEqual(
        heapFn().map(r => r.trip.code),
        sortFn().map(r => r.trip.code)
    );

    // Warm up the JavaScript engine.
    for (let i = 0; i < 5; i++) {
        heapFn();
        sortFn();
    }

    const heapTimes = [];
    const sortTimes = [];

    // Alternate execution order to reduce measurement bias.
    for (let i = 0; i < 25; i++) {
        const methods = i % 2 === 0
            ? [['heap', heapFn], ['sort', sortFn]]
            : [['sort', sortFn], ['heap', heapFn]];

        for (const [name, fn] of methods) {
            const start = performance.now();
            fn();
            const duration = performance.now() - start;

            if (name === 'heap') {
                heapTimes.push(duration);
            } else {
                sortTimes.push(duration);
            }
        }
    }

    const heapMs = median(heapTimes);
    const sortMs = median(sortTimes);

    return {
        trips: trips.length,
        heapMs: heapMs.toFixed(3),
        fullSortMs: sortMs.toFixed(3),
        speedup: (sortMs / heapMs).toFixed(2) + 'x',
        resultsMatch: 'YES'
    };
}

console.log('\nCS-499 Milestone Three - Performance Benchmark');
console.log('Each algorithm is measured 25 times.\n');

const sizes = [1000, 10000, 50000];
const results = sizes.map(size =>
    benchmark(generateTrips(size))
);

console.table(results);