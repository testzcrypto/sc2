const jwt = require('jsonwebtoken');
const { tokens } = require('../db/models');

/**
 * Check if user allow app proxy account to post on his behalf
 * And if app allow @steemconnect to post on his behalf
 */
const verifyPermissions = async (req, res, next) => {
  const accounts = await req.steem.api.getAccountsAsync([req.proxy, req.user]);

  const userAccountAuths = accounts[1].posting.account_auths.map(account => account[0]);
  if (userAccountAuths.indexOf(req.proxy) === -1) {
    res.status(401).json({
      error: 'unauthorized_client',
      error_description: `The app @${req.proxy} doesn't have permission to broadcast for @${req.user}`,
    });
  } else {
    const appAccountAuths = accounts[0].posting.account_auths.map(account => account[0]);
    if (appAccountAuths.indexOf(process.env.BROADCASTER_USERNAME) === -1) {
      res.status(401).json({
        error: 'unauthorized_client',
        error_description: `Broadcaster account doesn't have permission to broadcast for @${req.proxy}`,
      });
    } else {
      next();
    }
  }
};

const strategy = (req, res, next) => {
  const token = req.get('authorization') || req.query.access_token;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    /* eslint-disable no-param-reassign */
    req.token = token;
    req.role = decoded.role;
    req.user = decoded.user;
    req.proxy = decoded.proxy;
    req.scope = decoded.scope || [];
    /* eslint-enable no-param-reassign */
  } catch (err) {
    // console.log(err);
  }
  next();
};

const authenticate = role => async (req, res, next) => {
  if (!req.role || (role && req.role !== role)) {
    res.status(401).json({
      error: 'invalid_grant',
      error_description: 'The access_token has invalid role',
    });
  } else if (req.role === 'app') {
    const token = await tokens.findOne({ where: { token: req.token } });
    if (!token) {
      res.status(401).json({
        error: 'invalid_grant',
        error_description: 'The access_token has been revoked',
      });
    } else {
      next();
    }
  } else {
    next();
  }
};

module.exports = {
  verifyPermissions,
  strategy,
  authenticate,
};
