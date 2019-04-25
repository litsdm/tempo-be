import { Router } from 'express';

import updateUser from '../actions/user/updateUser';
import getUserFriends from '../actions/user/getUserFriends';

const router = Router();

router.put('/:userId/update', updateUser);
router.get('/:userId/friends', getUserFriends);

export default router;
