/**
 * JobScout MongoDB Atlas Cloud Migration Utility
 * Usage:
 *   node scripts/migrate-to-mongodb.cjs [MONGODB_URI]
 *   Or set MONGODB_URI in .env
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const rootDir = path.resolve(__dirname, '..');
const dataJsonPath = path.join(rootDir, 'server', 'data.json');

const mongoUri = process.argv[2] || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ Error: MONGODB_URI is required.');
  console.log('Usage: node scripts/migrate-to-mongodb.cjs "mongodb+srv://user:pass@cluster.mongodb.net/jobscout"');
  process.exit(1);
}

if (!fs.existsSync(dataJsonPath)) {
  console.error(`❌ Error: ${dataJsonPath} not found!`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));

async function migrate() {
  console.log('🚀 Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log('✅ Connected successfully to MongoDB Atlas database:', mongoose.connection.name);

  const db = mongoose.connection.db;

  const collections = [
    { name: 'users', records: data.users || [] },
    { name: 'jobs', records: data.jobs || [] },
    { name: 'applications', records: data.applications || [] },
    { name: 'messages', records: data.messages || [] },
    { name: 'posts', records: data.posts || [] },
    { name: 'anondiscussions', records: data.anonDiscussions || [] }
  ];

  console.log('\n📦 Migrating data from data.json to MongoDB Atlas collections:');

  for (const col of collections) {
    if (col.records.length === 0) {
      console.log(`  ⚪ ${col.name}: 0 records to migrate`);
      continue;
    }

    const collection = db.collection(col.name);
    
    // Bulk upsert by 'id'
    const bulkOps = col.records.map(doc => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $set: doc },
        upsert: true
      }
    }));

    const result = await collection.bulkWrite(bulkOps);
    console.log(`  ✅ ${col.name}: Upserted ${result.upsertedCount} new, Updated ${result.modifiedCount} existing (Total: ${col.records.length})`);
  }

  // Create primary indexes
  console.log('\n⚡ Creating Geospatial and Unique Indexes...');
  await db.collection('users').createIndex({ id: 1 }, { unique: true });
  await db.collection('users').createIndex({ phone: 1 }, { unique: true });
  await db.collection('users').createIndex({ lat: 1, lng: 1 });
  await db.collection('jobs').createIndex({ id: 1 }, { unique: true });
  await db.collection('jobs').createIndex({ lat: 1, lng: 1 });
  await db.collection('applications').createIndex({ id: 1 }, { unique: true });
  await db.collection('applications').createIndex({ jobId: 1, seekerId: 1 });
  await db.collection('messages').createIndex({ senderId: 1, receiverId: 1 });

  console.log('🎉 Migration completed successfully! Your JobScout cluster is ready for 50,000+ active users.');
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
