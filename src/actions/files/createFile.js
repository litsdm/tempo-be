import File from '../../models/file';

const saveFile = (fileBody) => new Promise((resolve, reject) => {
  const file = new File(fileBody);
  file.save(error => {
    if (error) reject(error);
    resolve(file);
  });
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.name) throw new Error('options.body.name is required.');
    if (!options.body.size) throw new Error('options.body.size is required.');
    if (!options.body.from) throw new Error('options.body.from is required.');
    if (!options.body.to) throw new Error('options.body.to is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[createFile.validateOptions] ${exception.message}`);
  }
}

const createFile = async ({ body }, response) => {
  try {
    validateOptions({ body, response });

    const file = await saveFile(body);

    response.status(200).send({ file });
  } catch(exception) {
    response.status(401).send({ message: exception.message });
    throw new Error(`[createFile] ${exception.message}`);
  }
}

export default createFile;
