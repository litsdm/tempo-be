import User from '../../../../models/user';

const findUserFriends = (userId) => new Promise((resolve, reject) => {
  User.findOne({ _id: userId })
    .populate({
      path: 'friends',
      options: { collation: { locale: 'en' }, sort: { username: 1 } }
    })
    .exec((error, user) => {
      if (error) reject(error)
      if (!user) reject(new Error(`Couldn\'t find user with id: ${userId}`));
      resolve(user.friends);
    });
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userId) throw new Error('options.params.userId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch(exception) {
    throw new Error(`[getUserFriends.validateOptions] ${exception.message}`);
  }
}

const getUserFriends = async ({ params }, response) => {
  try {
    const { userId } = params;
    validateOptions({ params, response });

    const friends = await findUserFriends(userId);

    response.status(200).send({ friends });
  } catch(exception) {
    response.status(500).send({ message: exception.message });
    throw new Error(`[getUserFriends] ${exception.message}`)
  }
}

export default getUserFriends;
