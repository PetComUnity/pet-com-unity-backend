import { Router } from 'express';

import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import petsRoutes from './pets.routes';
import sheltersRoutes from './shelters.routes';
import vetsRoutes from './vets.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/pets', petsRoutes);
router.use('/shelters', sheltersRoutes);
router.use('/vets', vetsRoutes);

export default router;
