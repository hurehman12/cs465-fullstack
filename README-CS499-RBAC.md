# CS-499 Enhancement One: Role-Based Access Control

## Overview
This enhancement adds role-based access control (RBAC) to
Travlr Getaways, originally developed during CS-465.

## Implemented Roles

| Operation | Administrator | Editor |
|-----------|---------------|--------|
| View Trips | Yes | Yes |
| Create Trips | Yes | Yes |
| Update Trips | Yes | Yes |
| Delete Trips | Yes | No |
| Register Users | Yes | No |

## Technical Improvements

- Added role field to the Mongoose User schema.
- Included user role in JWT authentication tokens.
- Created reusable backend authorization middleware.
- Protected API endpoints based on user permissions.
- Updated Angular to hide Delete Trip from Editors.
- Restricted user registration to Administrators.
- Added automated RBAC tests.
- Created an initial Administrator bootstrap script.

## Application Setup

Requirements:
- Node.js and npm
- MongoDB running locally

Install backend dependencies:

    npm install

Install Angular dependencies:

    cd app_admin
    npm install
    cd ..

Create a local .env file containing a JWT_SECRET value.
Do not commit the .env file to Git.

## Initial Administrator Setup

For a fresh database, configure the following environment
variables before running the bootstrap script:

- RBAC_BOOTSTRAP_EMAIL
- RBAC_BOOTSTRAP_NAME
- RBAC_BOOTSTRAP_PASSWORD

The bootstrap password must contain at least 12 characters.

Run:

    node scripts/bootstrap-admin.js

The script refuses to create another Administrator if one
already exists. It is not intended to run automatically.

## Start the Application

Backend (from project root):

    npm start

Angular (from app_admin directory):

    npm start

Backend: http://localhost:3000
Angular: http://localhost:4200

## Automated Testing

Automated RBAC tests are located at:

    tests/rbac.test.js

Start the backend before running the tests.

Provide valid Administrator and Editor JWTs through the
RBAC_ADMIN_TOKEN and RBAC_EDITOR_TOKEN environment variables.

Run:

    node --test tests/rbac.test.js

Testing requires both an Administrator and Editor account.

## Security Notes

- The backend enforces permissions independently of Angular.
- New registered users receive the Editor role.
- Only Administrators can register additional users.
- JWTs expire after one hour.
- Do not commit passwords, JWTs, or .env files.
