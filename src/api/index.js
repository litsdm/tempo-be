import { version } from '../../package.json';
import { Router } from 'express';
import auth from './auth';
import files from './files';
import user from './user';
import friendRequest from './friendRequest';

export default () => {
	let api = Router();

	api.use('/', auth);
	api.use('/', files);
	api.use('/', user);
	api.use('/', friendRequest);

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
