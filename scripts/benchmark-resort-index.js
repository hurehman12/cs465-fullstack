'use strict';

const mongoose = require('mongoose');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const {
    buildResortReportPipeline
} = require('../app_api/services/trip-reporting');

const database =
    'travlr_cs499_benchmark';

const collectionName =
    'tmp_resort_' + randomUUID().replace(/-/g, '');

const totalTrips = 50000;
const targetResort = 'Benchmark Resort 07';

async function main() {
    let connection;
    let collection;

    try {
        connection = await mongoose.createConnection(
            'mongodb://127.0.0.1:27017/' + database,
            {
                autoIndex: false,
                autoCreate: false
            }
        ).asPromise();

        collection = connection.db.collection(
            collectionName
        );

        console.log('\nCreating isolated benchmark data...');

        // Generate 50,000 test trips in batches.
        for (let start = 0; start < totalTrips; start += 5000) {

            const documents = [];

            for (
                let i = start;
                i < Math.min(start + 5000, totalTrips);
                i++
            ) {
                documents.push({
                    code: 'BENCH' + i,
                    resort: 'Benchmark Resort ' +
                        String(i % 50).padStart(2, '0'),
                    perPerson: String(
                        500 + (i % 1200)
                    )
                });
            }

            await collection.insertMany(documents);
        }

        const query = {
            resort: targetResort
        };

        const pipeline = [
            { $match: query },
            ...buildResortReportPipeline()
        ];

        // BASELINE: No resort index.
        console.log('\nMeasuring unindexed query...');

        const before = await collection
            .find(query)
            .explain('executionStats');

        const reportBefore = await collection
            .aggregate(pipeline)
            .toArray();

        // OPTIMIZATION: Add an index.
        console.log('Creating resort index...');

        await collection.createIndex(
            { resort: 1 },
            { name: 'resort_1' }
        );

        // AFTER: Repeat the same query.
        console.log('Measuring indexed query...');

        const after = await collection
            .find(query)
            .explain('executionStats');

        const reportAfter = await collection
            .aggregate(pipeline)
            .toArray();

        // Verify identical reporting results.
        assert.deepEqual(
            reportBefore,
            reportAfter
        );

        assert.equal(
            before.executionStats.nReturned,
            after.executionStats.nReturned
        );

        console.log('\n--- QUERY PERFORMANCE ---');

        console.table([
            {
                method: 'Before index',
                documentsExamined:
                    before.executionStats.totalDocsExamined,
                keysExamined:
                    before.executionStats.totalKeysExamined,
                results:
                    before.executionStats.nReturned,
                executionMs:
                    before.executionStats.executionTimeMillis
            },
            {
                method: 'After index',
                documentsExamined:
                    after.executionStats.totalDocsExamined,
                keysExamined:
                    after.executionStats.totalKeysExamined,
                results:
                    after.executionStats.nReturned,
                executionMs:
                    after.executionStats.executionTimeMillis
            }
        ]);

        console.log(
            '\nAggregation results match: YES'
        );

        console.log(
            'Target resort trips:',
            reportAfter[0]?.tripCount ?? 0
        );

    } catch (error) {
        console.error(
            'Benchmark failed:',
            error.message
        );
        process.exitCode = 1;
    } finally {

        // Delete only the temporary collection created
        // by this benchmark.
        if (collection) {
            await collection.drop().catch(error => {
                console.error(
                    'Temporary collection cleanup failed:',
                    error.message
                );
                process.exitCode = 1;
            });
        }

        if (connection) {
            await connection.close();
        }
    }
}

main();