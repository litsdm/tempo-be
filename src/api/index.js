import { version } from '../../package.json';
import { Router } from 'express';
import auth from './auth';
import files from './files';
import user from './user';
import friendRequest from './friendRequest';
import stripe from './stripe';
import email from './email';
import link from './link';

export default () => {
	let api = Router();

	api.use('/', auth);
	api.use('/', files);
	api.use('/', user);
	api.use('/', friendRequest);
	api.use('/', stripe);
	api.use('/', email);
	api.use('/', link);

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
