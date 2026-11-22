'use strict';

// Convert a stored price such as "799.00" into a number.
function parsePrice(value) {
    const cleaned = String(value ?? '').replace(/[$,\s]/g, '');
    if (!cleaned) return null;

    const price = Number(cleaned);
    return Number.isFinite(price) && price >= 0 ? price : null;
}

// Extract trip duration from "4 nights / 5 days".
function parseDays(length) {
    const match = String(length ?? '').match(/(\d+)\s*days?/i);
    return match ? Number(match[1]) : null;
}

// Calculate a weighted recommendation score.
function scoreTrip(trip, preferences) {
    let score = 0;

    // Destination/resort match: 50 points
    const destination = String(
        preferences.destination ?? ''
    ).trim().toLowerCase();

    const resort = String(trip.resort ?? '').toLowerCase();

    if (destination && resort.includes(destination)) {
        score += 50;
    }

    // Budget match: 30 points
    const budget = Number(preferences.budget);
    const price = parsePrice(trip.perPerson);

    if (budget > 0 && Number.isFinite(budget) &&
        price !== null && price <= budget) {
        score += 30;
    }

    // Duration match: up to 20 points
    const requestedDays = Number(preferences.days);
    const actualDays = parseDays(trip.length);

    if (requestedDays > 0 && Number.isFinite(requestedDays) &&
        actualDays !== null) {
        const difference = Math.abs(actualDays - requestedDays);
        const match = Math.max(0, 1 - difference / requestedDays);
        score += 20 * match;
    }

    return Math.round(score * 100) / 100;
}

// Min-heap: keeps the lowest-ranked recommendation at the root.
class MinHeap {
    constructor(compare) {
        this.items = [];
        this.compare = compare;
    }

    get size() {
        return this.items.length;
    }

    peek() {
        return this.items[0];
    }

    push(item) {
        this.items.push(item);
        let index = this.items.length - 1;

        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (this.compare(this.items[index], this.items[parent]) >= 0) {
                break;
            }

            [this.items[index], this.items[parent]] =
                [this.items[parent], this.items[index]];

            index = parent;
        }
    }

    replaceRoot(item) {
        this.items[0] = item;
        let index = 0;

        while (true) {
            const left = index * 2 + 1;
            const right = left + 1;
            let smallest = index;

            if (left < this.size &&
                this.compare(this.items[left], this.items[smallest]) < 0) {
                smallest = left;
            }

            if (right < this.size &&
                this.compare(this.items[right], this.items[smallest]) < 0) {
                smallest = right;
            }

            if (smallest === index) break;

            [this.items[index], this.items[smallest]] =
                [this.items[smallest], this.items[index]];

            index = smallest;
        }
    }
}

// Compare scores, then use trip code to break ties consistently.
function compareRecommendations(a, b) {
    return a.score - b.score ||
        String(b.trip.code).localeCompare(String(a.trip.code));
}

// Return the top K recommendations using the min-heap.
function recommendTrips(trips, preferences, k = 5) {
    if (!Array.isArray(trips)) {
        throw new TypeError('Trips must be an array');
    }

    if (!Number.isInteger(k) || k < 1) {
        throw new RangeError('K must be a positive integer');
    }

    const heap = new MinHeap(compareRecommendations);

    for (const trip of trips) {
        const recommendation = {
            trip,
            score: scoreTrip(trip, preferences)
        };

        if (heap.size < k) {
            heap.push(recommendation);
        } else if (
            compareRecommendations(recommendation, heap.peek()) > 0
        ) {
            heap.replaceRoot(recommendation);
        }
    }

    // Sort only the selected recommendations, not every trip.
    return heap.items.sort((a, b) => compareRecommendations(b, a));
}

module.exports = {
    parsePrice,
    parseDays,
    scoreTrip,
    recommendTrips
};
