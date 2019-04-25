import File from '../../models/file';
import User from '../../models/user';

const findFiles = () => new Promise((resolve, reject) => {
  File.find({ $or: [ { isGroup: false }, { isGroup: { $exists: false } } ] }, {}, { sort: { createdAt: -1 } })
  .populate('from', '_id username email placeholderColor profilePic tag')
  .populate('to', '_id username email placeholderColor profilePic tag')
  .exec((error, files) => {
    if (error) reject(error);
    resolve(files);
  });
})

const getUserIfAdmin = (userId) => new Promise((resolve, reject) => {
  User.findOne({ _id: userId }, 'role', (error, user) => {
    if (error) reject(error);
    if (!user || user.role !== 'admin') reject(new Error('[getAllFiles.getUserIfAdmin] Permissions required.'));
    resolve(user);
  })
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userId) throw new Error('options.params.userId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[getAllFiles.validateOptions] ${exception.message}`);
  }
}

const getAllFiles = async ({ params }, response) => {
  try {
    validateOptions({ params, response });

    await getUserIfAdmin(params.userId);
    const files = await findFiles();

    response.status(200).send({ files, hasAccess: true })
  } catch(exception) {
    response.status(500).send({ hasAccess: false });
    throw new Error(`[getAllFiles] ${exception.message}`);
  }
}

export default getAllFiles;
