import File from '../../../../models/file';

const deleteFileFromDB = (fileID) => new Promise((resolve, reject) => {
  File.findOneAndDelete({ _id: fileID }, (error) => {
    if (error) reject(error);
    resolve();
  });
});

const saveFile = file => new Promise((resolve, reject) => {
  file.save(error => {
    if (error) reject(error);
    resolve()
  });
});

const findFile = fileID => new Promise((resolve, reject) => {
  File
    .findOne({ _id: fileID })
    .exec((error, file) => {
    if (error) reject(error);
    resolve(file)
  });
});

const updateFileRecipients = async (userID, fileID) => {
  try {
    const file = await findFile(fileID);

    const index = file.to.indexOf(userID);
    if (index > -1) file.to.splice(index, 1);

    await saveFile(file);

    return file.to.length;
  } catch (exception) {
    throw new Error(`[deleteFile.updateFileRecipients] ${exception.message}`);
  }
};

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
