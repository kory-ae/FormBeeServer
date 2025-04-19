import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import logger from './config/logger.js';

import stripeWebhookRoutes from './routes/stripeWebhookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import formRoutes from './routes/formRoutes.js';
import jotFormRoutes from './routes/jotFormRoutes.js';
import formGroupRoutes from './routes/formGroupRoutes.js';
import jotSubmissionRoutes from './routes/jotSubmissionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { pingSupabase} from './services/supabasePing.js'

function listRoutes() {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Direct route
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase()
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace('(?:\\/)?$', '')
            .replace(/\\\//g, '/');
          routes.push({
            path: path + handler.route.path,
            method: Object.keys(handler.route.methods)[0].toUpperCase()
          });
        }
      });
    }
  });
  console.log('Registered Routes:');
  console.table(routes);
}

dotenv.config({path: process.env.ENV_FILE || '.env'} );

const app = express();
const port = process.env.PORT || 3000;

//this route has to come before express.json middleware because that 
//messes with what stripe expects from a req.body.
app.use('/api/stripe/webhook', 
  express.raw({type: 'application/json'}),
  stripeWebhookRoutes
);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb'}));

// Routes
app.use('/api', userRoutes);
app.use('/api', formGroupRoutes);
app.use('/api', formRoutes);
app.use('/api', jotFormRoutes);
app.use('/api', jotSubmissionRoutes);
app.use('/api', testRoutes);
app.use('/api', paymentRoutes)

app.use((req, res, next) => {
  console.log('404 Not Found:', req.method, req.originalUrl);
  next();
});

listRoutes();


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