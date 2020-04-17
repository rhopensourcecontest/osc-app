const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongodb = new MongoMemoryServer();

/**
 * Connect to the in-memory database.
 */
connect = async () => {
  const uri = await mongodb.getConnectionString();

  const mongooseConfig = {
    poolSize: 10,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }

  await mongoose.connect(uri, mongooseConfig);
};

/**
 * Drop database, close the connection and stop mongodb.
 */
closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongodb.stop();
};

/**
 * Remove all the data for all db collections.
 */
clearDatabase = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
};

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => await clearDatabase());

/**
 * Remove and close the db. Stop server.
 */
afterAll(async () => await closeDatabase());
