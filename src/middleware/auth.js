import { supabase } from '../config/supabase.js';
import { isPaidAccount, configureUser} from '../services/userConfigService.js';
import { ACCOUNT_TYPES } from '../types/accountTypes.js';
import logger from '../config/logger.js';


export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      logger.error("Attempted to authenticate without bearer token")
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      logger.error("Attempted to authenticate but token appears invalid")
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;

    if (!user.is_anonymous) {
      req.user.isPaid = await isPaidAccount(req.user.id);
      if (req.user.isPaid == ACCOUNT_TYPES.NOT_CONFIGURED) {
        const data = await configureUser(user)
        req.user.isPaid = await isPaidAccount(req.user.id);
      }
    } else {
      req.user.isPaid = false;
    }
    next();
  } catch (error) {
    logger.error('Auth failed internally.')
    logger.error(error)
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const isPaid = async (req, res, next) => {
  if ( !req.user?.isPaid ) {
    return res.status(403).json({error: "This account cannot use this functionality"})
  }
  next();
};
