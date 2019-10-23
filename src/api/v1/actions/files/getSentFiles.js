import File from '../../../../models/file';

const getFilesByUser = userID => new Promise((resolve, reject) => {
  File.find({ from: userID }, {}, { sort: { createdAt: -1 } })
    .populate('to', '_id username')
    .exec((error, files) => {
      if (error) reject(error);
      resolve(files);
    });
});

const validateOptions = options => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userID) throw new Error('options.params.userID is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[getUserFiles.validateOptions] ${exception.message}`);
  }
}

const getSentFiles = async ({ params }, response) => {
  try {
    validateOptions({ params, response });

    const files = await getFilesByUser(params.userID);

    response.status(200).send({ files });
  } catch (exception) {
    response.status(500).end();
    console.error(`[getSentFiles] ${exception.message}`);
  }
}

export default getSentFiles;
