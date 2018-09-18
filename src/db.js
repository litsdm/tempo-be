import mongoose from 'mongoose';
require('dotenv').config()

const dbName = process.env.TEMPO_ENV === 'production'
  ? 'ds253922.mlab.com:53922/tempo-prod'
  : 'ds253922.mlab.com:53922/tempo-dev';

const MONGO_URL = process.env.OFFLINE
  ? 'mongodb://localhost:27017/tempo'
  : `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${dbName}`;

export default callback => {
	mongoose.connect(MONGO_URL, { useNewUrlParser: true });
  const db = mongoose.connection;
  db.once('open', () => callback(db));
}
