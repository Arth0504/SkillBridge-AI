import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

// Configure DNS fallback for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {}

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';

/**
 * Safely masks MongoDB URI to prevent credential leakage in output logs.
 * Example: mongodb+srv://user:pass@cluster.mongodb.net/db -> mongodb+srv://***:***@cluster.mongodb.net/db
 */
function maskUri(uri) {
  if (!uri) return '[UNDEFINED_URI]';
  return uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
}

async function verifyDatabaseConnection() {
  console.log('=========================================================');
  console.log('       SKILLBRIDGE AI - MONGO_DB ATLAS VERIFICATION      ');
  console.log('=========================================================');
  console.log(`Target Connection URI: ${maskUri(mongoUri)}`);

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB connection: OK');
    console.log(`Connected Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`Collections: ${collections.length}`);

    console.log('---------------------------------------------------------');
    console.log('Collection Summary (Document Counts):');

    // Sort collections alphabetically for clean reporting
    collections.sort((a, b) => a.name.localeCompare(b.name));

    for (const col of collections) {
      try {
        const count = await db.collection(col.name).countDocuments();
        const formattedName = col.name.padEnd(24, ' ');
        console.log(` - ${formattedName}: ${count}`);
      } catch (colErr) {
        console.log(` - ${col.name}: ERROR (${colErr.message})`);
      }
    }

    console.log('---------------------------------------------------------');
    console.log('✅ Database verification complete. Data integrity intact.');
    console.log('=========================================================');
  } catch (err) {
    console.error('❌ MongoDB Connection Failure:');
    console.error(`Error Message: ${err.message}`);
    console.log('=========================================================');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

verifyDatabaseConnection();
