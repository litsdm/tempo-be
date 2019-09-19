import File from '../../models/file';

const deleteFilesFromDB = files => new Promise((resolve, reject) => {
  File.deleteMany({ _id: { $in: files } }, error => {
    if (error) reject(error);
    resolve();
  })
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.files) throw new Error('options.body.files is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[deleteManyFiles.validateOptions] ${exception.message}`);
  }
}

const deleteManyFiles = async ({ body }, response) => {
  try {
    const { files } = body;
    validateOptions({ body, response });

    await deleteFilesFromDB(files);

    response.status(200).send();
  } catch(exception) {
    response.status(500).end();
    throw new Error(`[deleteManyFiles] ${exception.message}`);
  }
}

export default deleteManyFiles;
