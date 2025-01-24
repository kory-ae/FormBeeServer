import express from 'express';
import logger from '../config/logger.js'

const router = express.Router();
const key = 'jasdf8234b1234VB'
const getNow = () => new Date().toLocaleString()

router.get(
    `/${key}/debug`,
    [ ],
    (req,res) => {
        const msg = `Test debug at ${getNow()}`
        logger.debug(msg);
        return res.status(200).json({status: msg})
    }
);

router.get(
    `/${key}/info`,
    [ ],
    (req,res) => {
        const msg = `Test info at ${getNow()}`
        logger.info(msg);
        return res.status(200).json({status: msg})
    }
);

router.get(
    `/${key}/warn`,
    [ ],
    (req,res) => {
        const msg = `Test warn at ${getNow()}`
        logger.warn(msg);
        return res.status(200).json({status: msg})
    }
);

router.get(
    `/${key}/error`,
    [ ],
    (req,res) => {
        const msg = `Test error at ${getNow()}`
        logger.error(msg);
        return res.status(200).json({status: msg})
    }
);

export default router;