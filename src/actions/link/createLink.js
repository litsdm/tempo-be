import Link from '../../models/link';

const saveLink = (linkData) => new Promise((resolve, reject) => {
  const link = new Link(linkData);
  link.save((error) => {
    if (error) reject(error);
    resolve(link)
  });
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.type) throw new Error('options.body.type is required.');
    if (!options.body.size) throw new Error('options.body.size is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[createLink.validateOptions] ${exception.message}`);
  }
}

const createLink = async ({ body }, response) => {
  try {
    validateOptions({ body, response });

    const link = await saveLink(body);

    response.status(200).send({ link });
  } catch(exception) {
    response.status(401).send({ message: exception.message });
    throw new Error(`[createLink] ${exception.message}`);
  }
}

export default createLink;
