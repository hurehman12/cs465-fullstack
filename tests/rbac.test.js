const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const baseUrl = 'http://localhost:3000/api';

const adminToken = process.env.RBAC_ADMIN_TOKEN;
const editorToken = process.env.RBAC_EDITOR_TOKEN;

const missingTripCode = 'CS499-NOT-FOUND-' + randomUUID();

test('Public users can view trips', async () => {
    const response = await fetch(`${baseUrl}/trips`);
    assert.equal(response.status, 200);
});

test('Unauthenticated users cannot create trips', async () => {
    const response = await fetch(`${baseUrl}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
    });

    assert.equal(response.status, 401);
});

test('Invalid JWT is rejected', async () => {
    const response = await fetch(`${baseUrl}/trips`, {
        method: 'POST',
        headers: { Authorization: 'Bearer invalid-token' }
    });

    assert.equal(response.status, 401);
});

test('Editor cannot delete trips', async () => {
    assert.ok(editorToken, 'Editor token is required');

    const response = await fetch(
        `${baseUrl}/trips/${missingTripCode}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${editorToken}`
            }
        }
    );

    assert.equal(response.status, 403);
});

test('Editor cannot register users', async () => {
    assert.ok(editorToken, 'Editor token is required');

    const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${editorToken}`,
            'Content-Type': 'application/json'
        },
        body: '{}'
    });

    assert.equal(response.status, 403);
});

test('Administrator passes DELETE authorization', async () => {
    assert.ok(adminToken, 'Administrator token is required');

    const url = `${baseUrl}/trips/${missingTripCode}`;

    const check = await fetch(url);
    assert.equal(check.status, 200);
    assert.deepEqual(await check.json(), []);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${adminToken}`
        }
    });

    assert.equal(response.status, 404);
});
