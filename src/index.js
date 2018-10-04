import http, { Server } from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import aws from 'aws-sdk';
import socketIo from 'socket.io';
import moment from 'moment';
import cron from 'node-cron';
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

app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {
	const signS3 = (req, res) => {
		const s3 = new aws.S3();
		const fileName = req.query['file-name'];
		const fileType = req.query['file-type'];
		const folderName = req.query['folder-name'];
		const s3Params = {
			Bucket: S3_BUCKET,
			Key: `${folderName}/${fileName}`,
			Expires: 60,
			ContentType: fileType,
			ACL: 'public-read'
		};

		s3.getSignedUrl('putObject', s3Params, (err, data) => {
			if (err) return res.end();

			const returnData = {
				signedRequest: data,
				url: `https://${S3_BUCKET}.s3.amazonaws.com/${folderName}/${fileName}`
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
	})

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));
	app.get('/api/sign-s3', signS3);
	app.post('/api/delete-s3', deleteS3);

	httpServer.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${httpServer.address().port}`);
	});

	io.on('connection', (socket) => {
		console.log('a user connected');
		socket.on('userConnection', userId => {
			socket.join(userId);
			logUserConnection(userId);
		});

		socket.on('sendFile', ({ roomId, file }) => {
			socket.to(roomId).emit('recieveFile', file);
		});

		socket.on('removeFileFromRoom', ({ roomId, index }) => {
			socket.to(roomId).emit('removeFile', index);
		})

		socket.on('logout', () => {
			socket.disconnect();
		});

		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	})
});

export default app;
