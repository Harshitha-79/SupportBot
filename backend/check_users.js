import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ role: 'it_support' }).select('name email isApproved role');
    console.log('IT Support Users:');
    users.forEach(u => console.log(`- ${u.name}: ${u.email} (approved: ${u.isApproved})`));
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkUsers();