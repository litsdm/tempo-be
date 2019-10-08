import { Router } from 'express';

import createFile from './actions/files/createFile';
import getUserFiles from './actions/files/getUserFiles';
import getAllFiles from './actions/files/getAllFiles';
import deleteFile from './actions/files/deleteFile';
import deleteManyFiles from './actions/files/deleteManyFiles';

const router = Router();

router.post('/files', createFile);
router.get('/:userId/files', getUserFiles);
router.get('/admin/:userId/files', getAllFiles);
router.delete('/:userId/files/:fileId', deleteFile);
router.delete('/files', deleteManyFiles);

export default router;
