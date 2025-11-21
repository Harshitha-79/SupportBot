import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}).select('name email role isApproved');
    console.log('All Users:');
    users.forEach(u => console.log(`- ${u.name}: ${u.email} (${u.role}, approved: ${u.isApproved})`));
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkAllUsers();