import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KbDocument from './src/models/KbDocument.js';

dotenv.config();

async function checkKB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const docs = await KbDocument.find({ approved: true }).select('title text');
    console.log('KB Documents:');
    docs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`Text: ${doc.text.substring(0, 200)}...`);
      console.log('---');
    });
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkKB();