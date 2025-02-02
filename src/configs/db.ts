import mongoose from 'mongoose';

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT_URI as string);
    console.log(`connected to database`);
  } catch (error) {
    console.error(error);
  }
};

export default db;
