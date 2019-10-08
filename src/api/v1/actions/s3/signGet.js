import aws from 'aws-sdk';

const { S3_BUCKET } = process.env;

const getSignedUrl = (s3, s3Params) => new Promise((resolve, reject) => {
  s3.getSignedUrl('getObject', s3Params, (error, data) => {
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
    throw new Error(`[signGet.validateOptions] ${exception.message}`);
  }
};

const signGet = async ({ query }, response) => {
  try {
    const s3 = new aws.S3();
		const filename = query['file-name'];
		const s3Params = {
			Bucket: S3_BUCKET,
			Key: `Files/${filename}`,
      Expires: 60,
      ResponseContentDisposition: `attachment; filename=${filename}`
		};

    validateOptions({ query, response });

    const signedRequest = await getSignedUrl(s3, s3Params);

    response.status(200).send({ signedRequest });
  } catch (exception) {
    response.status(500).end();
    throw new Error(`[signGet] ${exception.message}`);
  }
}

export default signGet;
