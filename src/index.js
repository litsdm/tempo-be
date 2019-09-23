import "babel-core/register";
import "babel-polyfill";
import http, { Server } from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import socketIo from 'socket.io';
import cron from 'node-cron';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

import deleteExpiredFiles from './actions/cron/deleteExpiredFiles';
import updateRestrictions from './actions/cron/updateRestrictions';
import onConnection from './sockets';

let app = express();
const httpServer = Server(app);
const io = socketIo(httpServer);

app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(cors({
	exposedHeaders: config.corsHeaders,
}));

app.use(bodyParser.json({limit: '50mb', extended: true}));

initializeDb( db => {
	cron.schedule('0 0 */3 * *', deleteExpiredFiles);
	cron.schedule('0 0 */1 * *', updateRestrictions);

	app.use(middleware({ config, db }));

	app.use('/api', api({ config, db }));

	io.on('connection', onConnection);

	httpServer.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${httpServer.address().port}`);
	});
});

export default app;
