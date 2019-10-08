import FriendRequest from '../../../../models/friendRequest';

const deleteFriendRequest = (requestId) => new Promise((resolve, reject) => {
  FriendRequest.findOneAndDelete({ _id: requestId }, (error) => {
    if (error) reject(error);
    resolve();
  });
});

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.requestId) throw new Error('options.params.requestId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch(exception) {
    throw new Error(`[rejectFriendRequest.validateOptions] ${exception.message}`);
  }
}

const rejectFriendRequest = async ({ params }, response) => {
  try {
    const { requestId } = params;
    validateOptions({ params, response });

    await deleteFriendRequest(requestId);

    response.status(200).send();
  } catch(exception) {
    response.status(500).send({ message: exception.message });
    throw new Error(`[rejectFriendRequest] ${exception.message}`)
  }
}

export default rejectFriendRequest;
