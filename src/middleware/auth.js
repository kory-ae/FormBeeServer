import { supabase } from '../config/supabase.js';
import { isPaidAccount, configureUser} from '../services/userConfigService.js';
import { ACCOUNT_TYPES } from '../types/accountTypes.js';
import logger from '../config/logger.js';


export const authenticate = async (req, res, next) => {
  try {
    logger.debug("start auth...")
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    logger.debug("get user done...")
    if (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    req.user.isPaid = await isPaidAccount(req.user.id);
    logger.debug("is paid done...")
    if (req.user.isPaid == ACCOUNT_TYPES.NOT_CONFIGURED) {
      logger.debug("config needed...")
      const data = await configureUser(user)
      req.user.isPaid = await isPaidAccount(req.user.id);
      logger.debug(".. config done")
    }
    logger.debug("...auth done")
    next();
  } catch (error) {
    logger.error('auth failed internally. ' + error)
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const isPaid = async (req, res, next) => {
    if ( !req.user?.isPaid ) {
      return res.status(403).json({error: "This account cannot use this functionality"})
    }
    next();
};
