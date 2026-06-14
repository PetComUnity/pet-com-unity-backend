import { Router } from 'express';

import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import calendarEventsRoutes from './calendarEvents.routes';
import healthRoutes from './health.routes';
import meRoutes from './me.routes';
import petsRoutes from './pets.routes';
import sheltersRoutes from './shelters.routes';
import filesRoutes from './files.routes';
import uploadRoutes from './upload.routes';
import vetsRoutes from './vets.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/me', meRoutes);
router.use('/pets', petsRoutes);
router.use('/shelters', sheltersRoutes);
router.use('/vets', vetsRoutes);
router.use('/calendar/events', calendarEventsRoutes);
router.use('/upload', uploadRoutes);
router.use('/files', filesRoutes);

export default router;
