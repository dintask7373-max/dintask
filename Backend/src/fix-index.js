const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const collections = await mongoose.connection.db.listCollections({ name: 'partners' }).toArray();
        if (collections.length > 0) {
            console.log('Dropping referralCode_1 index...');
            try {
                await mongoose.connection.db.collection('partners').dropIndex('referralCode_1');
                console.log('Index dropped successfully.');
            } catch (err) {
                if (err.codeName === 'IndexNotFound') {
                    console.log('Index not found, skipping...');
                } else {
                    throw err;
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error fixing index:', err);
        process.exit(1);
    }
};

fixIndex();
