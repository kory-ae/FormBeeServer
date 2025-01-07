import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import logger from './config/logger.js';

import userRoutes from './routes/userRoutes.js';
import jotFormRoutes from './routes/jotFormRoutes.js';
import jotSubmissionRoutes from './routes/jotSubmissionRoutes.js';
import { pingSupabase} from './services/supabasePing.js'


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api', jotFormRoutes);
app.use('/api', jotSubmissionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// check supabase latency
app.get('/instrument', async (req, res) => {
  logger.debug('Measuring Supabase latency...')
  const stats = await pingSupabase(5)
  res.status(200).json(stats)

});


/*app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup('swagger-output.json')
);*/


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logger.info(" ... from winston!!!")
});