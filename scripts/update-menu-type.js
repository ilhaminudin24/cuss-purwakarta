const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/your-db-name'; // Update with your DB name if needed
const dbName = uri.split('/').pop().split('?')[0];

const websiteTitles = [
  'Beranda',
  'Layanan',
  'Cara Pesan',
  'Testimoni',
  'FAQ',
  'Tentang',
  'Kontak',
];

const adminTitles = [
  'Services',
  'FAQs',
  'Navigation',
  'Users',
  'Booking-Form',
];

async function updateMenuTypes() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('navigationmenu');
    console.log('Connected to database:', db.databaseName);
    console.log('Using collection:', collection.collectionName);

    // Update ALL documents to set menuType: 'website'
    const result = await collection.updateMany(
      {},
      { $set: { menuType: 'website' } }
    );
    console.log(`All menu items updated: ${result.modifiedCount}`);
  } catch (err) {
    console.error('Error updating menu types:', err);
  } finally {
    await client.close();
  }
}

updateMenuTypes(); 