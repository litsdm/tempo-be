import http, { Server } from 'http';
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import aws from 'aws-sdk';
import socketIo from 'socket.io';
import moment from 'moment';
import cron from 'node-cron';
import Expo from 'expo-server-sdk';
import uuid from 'uuid/v4';
import archiver from 'archiver';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

import User from './models/user';
import Files from './models/file';

const { S3_BUCKET } = process.env;

let app = express();
const httpServer = Server(app);
const io = socketIo(httpServer);

const expo = new Expo();

app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors());

app.use(bodyParser.json({limit: '50mb', extended: true}));

// connect to db
initializeDb( db => {
	const signS3 = (req, res) => {
		const s3 = new aws.S3();
		const fileName = req.query['file-name'];
		const fileType = req.query['file-type'];
		const folderName = req.query['folder-name'];
		const randomIndex = Math.floor(Math.random() * (4 - 0 + 1));
		const uniqueFilename = `${uuid().split('-')[randomIndex]}-${fileName}`
		const s3Params = {
			Bucket: S3_BUCKET,
			Key: `${folderName}/${uniqueFilename}`,
			Expires: 60,
			ContentType: fileType,
			ACL: 'public-read'
		};

		s3.getSignedUrl('putObject', s3Params, (err, data) => {
			if (err) { console.log(err); return res.end(); }

			const returnData = {
				signedRequest: data,
				url: `https://${S3_BUCKET}.s3.amazonaws.com/${folderName}/${uniqueFilename}`
			};
			res.write(JSON.stringify(returnData));
			res.end();
		});
	};

	const deleteS3 = (req, res) => {
		const s3 = new aws.S3();
		const { filename } = req.body;
		const s3Params = {
			Bucket: S3_BUCKET,
			Key: `Files/${filename}`
		};

		s3.deleteObject(s3Params, (err) => {
			if (err) console.log(err);

			res.end();
		});
	};

	const compressAndUpload = ({ body: { files } }, res) => {
		// create a zip file output path
		const outputPath = __dirname + '/FeatherFiles.zip'
		const output = fs.createWriteStream(outputPath);

		// create archive
		const archive = archiver('zip');

		// pipe archive data to output
		archive.pipe(output);

		// change files from json string to ArrayBuffer to Buffer.
		const bufferFiles = files.map(({ name, data }) => ({
			name,
			buffer: Buffer.from(data, 'base64')
		}));

		// Append files to zip archive
		bufferFiles.forEach(({ buffer, name }) => archive.append(buffer, { name }))

		// Listen for onClose event
		output.on('close', () => {
			// Upload archive to s3
			const zipFile = fs.readFileSync(`${__dirname}/FeatherFiles.zip`);
			const s3 = new aws.S3();
			const randomIndex = Math.floor(Math.random() * (4 - 0 + 1));
			const uniqueFilename = `${uuid().split('-')[randomIndex]}-FeatherFiles.zip`;
			const params = {
				Bucket: S3_BUCKET,
				Key: `Files/${uniqueFilename}`,
				ContentType: 'application/zip',
				ACL: 'public-read',
				Body: Buffer.from(zipFile)
			}
			s3.putObject(params, (err) => {
				fs.unlinkSync(outputPath);
				if (err) return res.status(400).send({ err }).end();
				const returnData = {
					size: archive.pointer(),
					url: `https://${S3_BUCKET}.s3.amazonaws.com/Files/${uniqueFilename}`
				};
				res.status(200).send(returnData);
				res.end();
			})
		});

		archive.finalize();
	};

	const logUserConnection = (userId) => {
		User.findByIdAndUpdate(userId, { $set: { lastConnection: new Date() } }, (err) => { if (err) console.log(err); });
	}

	cron.schedule('0 0 0 */3 * *', () => {
		User
		.find()
		.select('_id lastConnection files')
		.populate('files')
		.exec((err, users) => {
			const s3 = new aws.S3();
			users.forEach(({ _id: userId, lastConnection, files }) => {
				const past = moment(lastConnection);
				if (moment().diff(past, 'days') >= 3) {
					// Delete files
					User.findByIdAndUpdate(userId, { $set: { files: [] } }, (err) => { if (err) console.log(err); });
					files.forEach(({ _id, name }) => {
						Files.findByIdAndRemove(_id, (err) => { if (err) console.log(err); });
						const s3Params = {
							Bucket: S3_BUCKET,
							Key: `Files/${name}`
						};

						s3.deleteObject(s3Params, (err) => {
							if (err) console.log(err);
						});
					});
				}
			});
		});
	});

	cron.schedule('0 0 0 1 * *', () => {
		User.updateMany({ isPro: false }, { $set: { remainingFiles: 10, remainingBytes: 2147483648 } }, (err, raw) => {
			// TODO: Handle error
		});

		User.updateMany({ isPro: true }, { $set: { remainingFiles: 10000, remainingBytes: 53687091200 } }, (err, raw) => {
			// TODO: Handle error
		})
	});

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
	app.options('*', cors());
	app.use('/api', api({ config, db }));
	app.get('/api/sign-s3', signS3);
	app.post('/api/delete-s3', deleteS3);
	app.post('/api/compressAndUpload', compressAndUpload);

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
