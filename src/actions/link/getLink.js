import Link from '../../models/link';

const findLink = (linkId) => new Promise((resolve, reject) => {
  Link
    .findOne({ _id: linkId })
    .populate('files', 'name type size s3Filename')
    .exec((error, link) => {
      if (error) reject(error);
      resolve(link);
    });
});

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.linkId) throw new Error('options.params.linkId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch(exception) {
    throw new Error(`[getLink.validateOptions] ${exception.message}`);
  }
}

const getLink = async ({ params }, response) => {
  try {
    const { linkId } = params;
    validateOptions({ params, response });

    const link = await findLink(linkId);

    response.status(200).send({ link });
  } catch(exception) {
    response.status(500).send({ message: exception.message });
    throw new Error(`[getLink] ${exception.message}`)
  }
}

export default getLink;
