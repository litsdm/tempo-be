import File from '../../../../models/file';

const fetchFiles = fileIDs => new Promise((resolve, reject) => {
  File.find({ _id: { $in: fileIDs } }, 'name type s3Filename', (error, files) => {
    if (error) reject(error);
    resolve(files);
  });
});

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.fileIDs) throw new Error('options.body.fileIDs is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[fetchLinkFiles.validateOptions] ${exception.message}`);
  }
}

const fetchLinkFiles = async ({ body }, response) => {
  try {
    const { fileIDs } = body;
    validateOptions({ body, response });

    const files = await fetchFiles(fileIDs);

    response.status(200).send({ files });
  } catch(exception) {
    response.status(500).send({ message: exception.message });
    throw new Error(`[fetchLinkFiles] ${exception.message}`);
  }
}

export default fetchLinkFiles;
