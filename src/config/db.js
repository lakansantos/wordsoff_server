import mongoose from 'mongoose';

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`connected to database`);
  } catch (error) {
    console.error('error');
  }
};

export default db;
