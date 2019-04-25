import FriendRequest from '../../models/friendRequest';

const findFriendRequests = (userId) => new Promise((resolve, reject) => {
  FriendRequest.find({ to: userId })
    .populate('from', '_id username placeholderColor')
    .exec((error, friendRequests) => {
      if (error) reject(error);
      resolve(friendRequests);
    });
});

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userId) throw new Error('options.params.userId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch(exception) {
    throw new Error(`[getFriendRequests.validateOptions] ${exception.message}`);
  }
}

const getFriendRequests = async ({ params }, response) => {
  try {
    const { userId } = params;
    validateOptions({ params, response });

    const friendRequests = await findFriendRequests(userId);

    response.status(200).send({ friendRequests });
  } catch(exception) {
    response.status(400).send({ message: exception.message });
    throw new Error(`[getFriendRequests] ${exception.message}`)
  }
}

export default getFriendRequests;
