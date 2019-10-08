import aws from 'aws-sdk';
import uuid from 'uuid/v4';

const { S3_BUCKET } = process.env;

const getSignedUrl = (s3, s3Params) => new Promise((resolve, reject) => {
  s3.getSignedUrl('putObject', s3Params, (error, data) => {
    if (error) reject(error);
    resolve(data);
  });
});

const validateOptions = options => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.query) throw new Error('options.query is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[signPut.validateOptions] ${exception.message}`);
  }
}

const signPut = async ({ query }, response) => {
  try {
    const options = {
			signatureVersion: 'v4',
			region: 'us-west-2',
			endpoint: new aws.Endpoint('feather-share.s3-accelerate.amazonaws.com'),
			useAccelerateEndpoint: true
		};
		const s3 = new aws.S3(options);
		const fileName = query['file-name'];
		const fileType = query['file-type'];
		const folderName = query['folder-name'];
		const randomIndex = Math.floor(Math.random() * (4 - 0 + 1));
		const uniqueFilename = `${uuid().split('-')[randomIndex]}-${fileName}`;
		const s3Params = {
			Bucket: S3_BUCKET,
			Key: `${folderName}/${uniqueFilename}`,
			Expires: 5 * 60,
			ContentType: fileType,
      // ACL: 'public-read'
		};

    validateOptions({ query, response });

    const signedRequest = await getSignedUrl(s3, s3Params);

    const returnData = {
      signedRequest,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${folderName}/${uniqueFilename}`,
      s3Filename: uniqueFilename
    };

    response.status(200).send(JSON.stringify(returnData));
  } catch (exception) {
    response.status(500).end();
    throw new Error(`[signPut] ${exception.message}`);
  }
}

export default signPut;
