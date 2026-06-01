import { Router } from 'express';

import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import meRoutes from './me.routes';
import petsRoutes from './pets.routes';
import sheltersRoutes from './shelters.routes';
import vetsRoutes from './vets.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/pets', petsRoutes);
router.use('/shelters', sheltersRoutes);
router.use('/vets', vetsRoutes);

export default router;
