import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function approveIT() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateOne(
      { email: 'hamshicr@gmail.com' },
      { isApproved: true, approvedAt: new Date() }
    );
    console.log('Approval result:', result);
    console.log('✅ hamshicr@gmail.com has been approved');
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

approveIT();