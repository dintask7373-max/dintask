const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Fix for referralCode duplicate null error
    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'partners' }).toArray();
      if (collections.length > 0) {
        await mongoose.connection.db.collection('partners').dropIndex('referralCode_1');
        console.log('Successfully dropped old referralCode_1 index to fix sparse constraint.');
      }
    } catch (indexError) {
      // Index might not exist or already be sparse, ignore error
      if (indexError.codeName !== 'IndexNotFound') {
        console.log('Note: Index repair skipped or handled:', indexError.message);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
