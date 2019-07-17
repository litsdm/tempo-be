import User from '../models/user';

const logUserConnection = (userId) => {
  User.findByIdAndUpdate(userId, { $set: { lastConnection: new Date() } }, (err) => { if (err) console.log(err); });
}

const connection = socket => {
  socket.on('userConnection', userId => {
    socket.join(userId);
    logUserConnection(userId);
  });

  socket.on('sendFile', ({ roomId, file }) => {
    socket.join(roomId);
    socket.to(roomId).emit('recieveFile', file);
    socket.leave(roomId);
    // sendFileReceivedPushNotification(roomId, file.name);
  });

  socket.on('sendRequest', ({ roomId, friendRequest }) => {
    socket.join(roomId);
    socket.to(roomId).emit('receiveFriendRequest', friendRequest);
    socket.leave(roomId);
    // sendFileReceivedPushNotification(roomId, file.name);
  });

  socket.on('acceptRequest', ({ roomId, friend }) => {
    socket.join(roomId);
    socket.to(roomId).emit('newFriend', friend);
    socket.leave(roomId);
  });

  socket.on('removeFileFromRoom', ({ roomId, index }) => {
    socket.to(roomId).emit('removeFile', index);
  });

  socket.on('updatedUser', ({ roomId, token }) => {
    socket.to(roomId).emit('updateUser', token);
  });

  socket.on('logout', () => {
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};


export default connection;
