import aws from 'aws-sdk';
import moment from 'moment';

import File from '../../../../models/file';
import Link from '../../../../models/link';

const { S3_BUCKET } = process.env;

const findExpiredLinks = () => new Promise((resolve, reject) => {
  Link.find({ expiresAt: { '$lt': new Date() } }, (error, links) => {
    if (error) reject(error);
    resolve(links);
  })
});

const deleteFromDB = (_id, model) => new Promise((resolve, reject) => {
  model.deleteOne({ _id }, error => {
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

const deleteDocuments = async (docs, s3, model) => {
  try {
    const s3Promises = [];
    const dbPromises = [];

    docs.forEach(({ _id, s3Filename }) => {
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: `Files/${s3Filename}`
      }

      s3Promises.push(deleteObject(s3, s3Params));
      dbPromises.push(deleteFromDB(_id, model));
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
    const s3 = new aws.S3();

    const files = await findExpiredFiles();
    await deleteDocuments(files, s3, File);

    const links = await findExpiredLinks();
    await deleteDocuments(links, s3, Link);
  } catch (exception) {
    throw new Error(`[deleteExpiredFiles] ${exception.message}`);
  }
}

export default deleteExpiredFiles;
