import Link from '../../models/link';

const deleteLinkFromDB = (linkId) => new Promise((resolve, reject) => {
  Link.findOneAndDelete({ _id: linkId }, (error) => {
    if (error) reject(error);
    resolve();
  });
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.linkId) throw new Error('options.params.linkId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch(exception) {
    throw new Error(`[deleteLink.validateOptions] ${exception.message}`);
  }
}

const deleteLink = async ({ params }, response) => {
  try {
    const { linkId } = params;
    validateOptions({ params, response });

    await deleteLinkFromDB(linkId);

    response.status(200).send();
  } catch(exception) {
    response.status(400).send({ message: exception.message });
    throw new Error(`[deleteLink] ${exception.message}`)
  }
}

export default deleteLink;
