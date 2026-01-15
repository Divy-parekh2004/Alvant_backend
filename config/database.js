const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    // Return if already connected
    if (isConnected) {
        console.log('✅ Using existing database connection');
        return mongoose.connection;
    }

    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error(
                'MongoDB URI is not defined. Please set MONGODB_URI or DATABASE_URL environment variable.'
            );
        }

        const connection = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 1,
            minPoolSize: 0,
        });

        isConnected = true;
        console.log('✅ Connected to MongoDB');
        return connection;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        throw error;
    }
};

module.exports = connectDB;
