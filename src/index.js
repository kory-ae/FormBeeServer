import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import logger from './config/logger.js';

import userRoutes from './routes/userRoutes.js';
import formRoutes from './routes/formRoutes.js';
import jotFormRoutes from './routes/jotFormRoutes.js';
import formGroupRoutes from './routes/formGroupRoutes.js';
import jotSubmissionRoutes from './routes/jotSubmissionRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { pingSupabase} from './services/supabasePing.js'


dotenv.config({path: process.env.ENV_FILE || '.env'} );

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb'}));

// Routes
app.use('/api', userRoutes);
app.use('/api', formGroupRoutes);
app.use('/api', formRoutes);
app.use('/api', jotFormRoutes);
app.use('/api', jotSubmissionRoutes);
app.use('/api', testRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', phase: "III" });
});

// check supabase latency
app.get('/instrument', async (req, res) => {
  logger.debug('Measuring Supabase latency...')
  const stats = await pingSupabase(5)
  res.status(200).json(stats)
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logger.info("PHASE III: Info logging from winston!!!")
});