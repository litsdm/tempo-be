import Link from '../../models/link';

const findLinks = userID => new Promise((resolve, reject) => {
  Link
    .find({ from: userID }, {}, { sort: { createdAt: -1 } })
    .populate('files', 'name type s3Filename')
    .exec((error, links) => {
      if (error) reject(error);
      resolve(links);
    })
});

const validateOptions = options => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userID) throw new Error('options.params.userID is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[getLinks.validateOptions] ${exception.message}`);
  }
}

const getLinks = async ({ params }, response) => {
  try {
    const { userID } = params;
    validateOptions({ params, response });

    const links = await findLinks(userID);

    response.status(200).send({ links });
  } catch (exception) {
    response.status(500).end();
    throw new Error(`[getLinks] ${exception.message}`);
  }
}

export default getLinks;
