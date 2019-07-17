import aws from 'aws-sdk';
import moment from 'moment';

import File from '../../models/file';

const { S3_BUCKET } = process.env;

const deleteDBFile = _id => new Promise((resolve, reject) => {
  File.deleteOne({ _id }, error => {
    if (error) reject(error);
    resolve();
  })
});

const deleteObject = (s3, s3Params) => new Promise((resolve, reject) => {
  s3.deleteObject(s3Params, error => {
    if (error) reject(error);
    resolve();
  });
});

const deleteFiles = async files => {
  try {
    const s3 = new aws.S3();
    const s3Promises = [];
    const dbPromises = [];

    files.forEach(({ _id, s3Filename }) => {
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: `Files/${s3Filename}`
      }

      s3Promises.push(deleteObject(s3, s3Params));
      dbPromises.push(deleteDBFile(_id));
    });

    await Promise.all(s3Promises);
    await Promise.all(dbPromises);
  } catch (exception) {
    throw new Error(`[deleteExpiredFiles.deleteFiles] ${exception.message}`);
  }
}

const findExpiredFiles = () => new Promise((resolve, reject) => {
  const yesterday = moment().substract(1, 'days');
  File.find({ createdAt: { '$lt': yesterday } }, (error, files) => {
    if (error) reject(error);
    resolve(files);
  });
});

const deleteExpiredFiles = async () => {
  try {
    const files = await findExpiredFiles();
    await deleteFiles(files);
  } catch (exception) {
    throw new Error(`[deleteExpiredFiles] ${exception.message}`);
  }
}

export default deleteExpiredFiles;
