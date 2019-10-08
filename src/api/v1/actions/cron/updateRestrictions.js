import User from '../../../../models/user';

const updatePro = () => new Promise((resolve, reject) => {
  User.updateMany(
    { isPro: true },
    { $set: { remainingTransfers: 10000, remainingFiles: 10000, remainingBytes: 32212254720 } },
    error => {
      if (error) reject(error);
      resolve();
  });
});

const updateNonPro = () => new Promise((resolve, reject) => {
  User.updateMany(
    { isPro: false },
    { $set: { remainingTransfers: 3, remainingFiles: 3, remainingBytes: 2147483648 } },
    error => {
      if (error) reject(error);
      resolve();
  });
});

const updateRestrictions = async () => {
  try {
    await updateNonPro();
    await updatePro();
  } catch (exception) {
    throw new Error(`[updateRestrictions] ${exception.message}`);
  }
}

export default updateRestrictions;
