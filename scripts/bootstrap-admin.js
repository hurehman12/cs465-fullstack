require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../app_api/models/user');

async function bootstrapAdmin() {
    const email = (process.env.RBAC_BOOTSTRAP_EMAIL || '')
        .trim().toLowerCase();

    const name = (process.env.RBAC_BOOTSTRAP_NAME ||
        'Initial Administrator').trim();

    const password = process.env.RBAC_BOOTSTRAP_PASSWORD || '';

    if (!email || password.length < 12) {
        throw new Error(
            'Provide an email and password of at least 12 characters.'
        );
    }

    const host = process.env.DB_HOST || '127.0.0.1';

    await mongoose.connect(`mongodb://${host}/travlr`);

    const adminCount = await User.countDocuments({
        role: 'admin'
    });

    if (adminCount > 0) {
        throw new Error(
            'An Administrator already exists. No changes made.'
        );
    }

    if (await User.exists({ email })) {
        throw new Error(
            'Email already exists. No changes made.'
        );
    }

    const admin = new User({
        name,
        email,
        role: 'admin'
    });

    admin.setPassword(password);
    await admin.save();

    console.log('Initial Administrator created successfully.');
}

bootstrapAdmin()
    .catch(err => {
        console.error('Bootstrap failed:', err.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });