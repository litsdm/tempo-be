import File from '../../../../models/file';

const findFilesFromUser = (userId) => new Promise((resolve, reject) => {
  File.find({ to: userId }, {}, { sort: { createdAt: -1 } })
  .populate('from', '_id username')
  .exec((error, files) => {
    if (error) reject(error);
    resolve(files);
  });
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userId) throw new Error('options.params.userId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[getUserFiles.validateOptions] ${exception.message}`);
  }
}

const getUserFiles = async ({ params }, response) => {
  try {
    validateOptions({ params, response });

    const files = await findFilesFromUser(params.userId);

    response.status(200).send({ files });
  } catch(exception) {
    response.status(500).end();
    throw new Error(`[getUserFiles] ${exception.message}`);
  }
}

export default getUserFiles;
