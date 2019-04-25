import File from '../../models/file';

const deleteFileFromDB = (fileId) => new Promise((resolve, reject) => {
  File.findOneAndDelete({ _id: fileId }, (error) => {
    if (error) reject(error);
    resolve();
  });
});

const updateFileRecipients = (userId, fileId) => new Promise((resolve, reject) => {
  File.findOneAndUpdate(
    { $and: [ { to: userId, _id: fileId } ] },
    { $pull: { to: userId } },
    (error, fileBeforeUpdate) => {
      if (error) reject(error);
      resolve(fileBeforeUpdate.to.length - 1);
  });
});

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userId) throw new Error('options.params.userId is required.');
    if (!options.params.fileId) throw new Error('options.params.fileId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[deleteFile.validateOptions] ${exception.message}`);
  }
}

const deleteFile = async ({ params }, response) => {
  try {
    const { userId, fileId } = params;
    let shouldDeleteS3 = false;

    validateOptions({ params, response });

    const recipientCount = await updateFileRecipients(userId, fileId);

    if (recipientCount === 0) {
      shouldDeleteS3 = true;
      await deleteFileFromDB(fileId);
    }

    response.status(200).send({ shouldDeleteS3 });
  } catch(exception) {
    response.status(500).end();
    throw new Error(`[deleteFile] ${exception.message}`);
  }
}

export default deleteFile;
