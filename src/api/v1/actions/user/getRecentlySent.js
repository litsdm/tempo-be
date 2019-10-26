import User from '../../../../models/user';

const findUserRecentEmails = userID => new Promise((resolve, reject) => {
  User.findOne({ _id: userID }, 'recentlySent', (error, user) => {
    if (error) reject(error);
    if (!user) reject(new Error(`Couldn\'t find user with id: ${userID}`));
    resolve(user.recentlySent);
  })
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userID) throw new Error('options.params.userID is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch(exception) {
    throw new Error(`[getRecentlySent.validateOptions] ${exception.message}`);
  }
}

const getRecentlySent = async ({ params }, response) => {
  try {
    const { userID } = params;
    validateOptions({ params, response });

    const recentEmails = await findUserRecentEmails(userID);
    response.status(200).send({ recentEmails });
  } catch(exception) {
    response.status(500).send({ message: exception.message });
    throw new Error(`[getRecentlySent] ${exception.message}`)
  }
}

export default getRecentlySent;
