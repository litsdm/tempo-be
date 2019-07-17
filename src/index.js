import "babel-core/register";
import "babel-polyfill";
import http, { Server } from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import socketIo from 'socket.io';
import cron from 'node-cron';
import Expo from 'expo-server-sdk';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

import User from './models/user';

import deleteExpiredFiles from './actions/cron/deleteExpiredFiles';
import updateRestrictions from './actions/cron/updateRestrictions';

let app = express();
const httpServer = Server(app);
const io = socketIo(httpServer);

const expo = new Expo();

app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders,
}));

app.use(bodyParser.json({limit: '50mb', extended: true}));

// connect to db
initializeDb( db => {
	const logUserConnection = (userId) => {
		User.findByIdAndUpdate(userId, { $set: { lastConnection: new Date() } }, (err) => { if (err) console.log(err); });
	}

	cron.schedule('0 0 0 */3 * *', deleteExpiredFiles);
	cron.schedule('0 0 0 1 * *', updateRestrictions);

	const sendFileReceivedPushNotification = (userId, filename) => {
		let messages = [];
		let chunks;
		User.findOne({ _id: userId }, 'expoToken', (err, { expoToken }) => {
			if (err || !Expo.isExpoPushToken(expoToken)) return;
			messages.push({
				to: expoToken,
				sound: 'default',
				body: `New file received ${filename}`,
			});

			chunks = expo.chunkPushNotifications(messages);
			for (let chunk of chunks) {
				expo.sendPushNotificationsAsync(chunk);
			}
		});
	}

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	httpServer.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${httpServer.address().port}`);
	});

	io.on('connection', (socket) => {
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
	})
});

export default app;
