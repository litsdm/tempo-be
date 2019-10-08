import { Router } from 'express';

import updateUser from './actions/user/updateUser';
import getUserFriends from './actions/user/getUserFriends';
import getLinks from './actions/user/getLinks';

const router = Router();

router.put('/:userId/update', updateUser);
router.get('/:userId/friends', getUserFriends);
router.get('/:userID/links', getLinks);

export default router;
