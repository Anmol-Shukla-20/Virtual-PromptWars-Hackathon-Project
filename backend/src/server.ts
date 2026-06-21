import app from './app';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecopath';

const startServer = () => {
    // 1. Start Express immediately so the UI can connect instantly
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

    // 2. Try connecting to MongoDB in the background
    mongoose.connect(MONGO_URI)
        .then(() => console.log('🌱 Connected to MongoDB'))
        .catch((dbError: any) => {
            console.warn('⚠️ MongoDB connection failed. Running backend in OFFLINE mode.', dbError.message);
        });
};

startServer();
