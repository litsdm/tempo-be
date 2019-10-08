import aws from 'aws-sdk';

const { S3_BUCKET } = process.env;

const deleteObject = (s3, s3Params) => new Promise((resolve, reject) => {
  s3.deleteObject(s3Params, error => {
    if (error) reject(error);
    resolve();
  });
})

const validateOptions = options => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.filename) throw new Error('options.body.filename is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[deleteS3.validateOptions] ${exception.message}`);
  }
}

const deleteS3 = async ({ body }, response) => {
  try {
    const s3 = new aws.S3();
		const { filename } = body;
		const s3Params = {
			Bucket: S3_BUCKET,
			Key: `Files/${filename}`
		};

    validateOptions({ body, response });

    await deleteObject(s3, s3Params);

    response.status(200).end();
  } catch (exception) {
    response.status(500).end();
    throw new Error(`[deleteS3] ${exception.message}`);
  }
};

export default deleteS3;
