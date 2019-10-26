import User from '../../../../models/user';

const saveUser = (user) => new Promise((resolve, reject) => {
  user.save(error => {
    if (error) reject(error);
    resolve();
  });
});

const findUser = userID => new Promise((resolve, reject) => {
  User.findOne({ _id: userID }, (error, user) => {
    if (error) reject(error);
    resolve(user);
  });
});

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userID) throw new Error('options.params.userID is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[updateUser.validateOptions] ${exception.message}`);
  }
}

const putRecentlySent = async ({ body, params }, response) => {
  try {
    const { userID } = params;
    const { recentEmails } = body;
    validateOptions({ body, params, response });

    let user = await findUser(userID);

    user.recentlySent = recentEmails;
    await saveUser(user);

    response.status(200).send();
  } catch (exception) {
    response.status(500).send({ message: exception.message });
    throw new Error(`[putRecentlySent] ${exception.message}`);
  }
};

export default putRecentlySent;
