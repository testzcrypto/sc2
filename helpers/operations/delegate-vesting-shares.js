const _ = require('lodash');
const steem = require('steem');
const { formatter } = require('steem');
const { isAsset, isEmpty, userExists, normalizeUsername } = require('../validation-utils');

const optionalFields = ['delegator'];

const parse = async (query) => {
  const cQuery = _.cloneDeep(query);
  const [amount, symbol] = cQuery.vesting_shares.split(' ');
  const globalProps = await steem.api.getDynamicGlobalPropertiesAsync();

  cQuery.delegatee = normalizeUsername(cQuery.delegatee);
  cQuery.delegator = normalizeUsername(cQuery.delegator);

  if (symbol === 'SP') {
    cQuery.vesting_shares = _.join([
      (
        (parseFloat(amount) *
        parseFloat(globalProps.total_vesting_shares)) /
        parseFloat(globalProps.total_vesting_fund_steem)
      ).toFixed(6),
      'VESTS',
    ], ' ');
  } else {
    cQuery.vesting_shares = _.join([parseFloat(amount).toFixed(6), symbol], ' ');
  }

  return cQuery;
};

const validate = async (query, errors) => {
  if (!isEmpty(query.delegatee) && !await userExists(query.delegatee)) {
    errors.push(`the user ${query.delegatee} doesn't exist`);
  }
  if (!isEmpty(query.delegator) && !await userExists(query.delegator)) {
    errors.push(`the user ${query.delegator} doesn't exist`);
  }

  if (!isEmpty(query.vesting_shares)) {
    if (!['VESTS', 'SP'].includes(query.vesting_shares.split(' ')[1])) {
      errors.push('please select a valid symbol: VESTS or SP');
    } else if (!isAsset(query.vesting_shares)) {
      errors.push('please type a valid amount, 12.123 SP or 12.123456 VESTS for example');
    }
  }
};

const normalize = async (query) => {
  const cQuery = _.cloneDeep(query);
  const [amount, symbol] = cQuery.vesting_shares.split(' ');
  if (amount && symbol === 'VESTS') {
    const globalProps = await steem.api.getDynamicGlobalPropertiesAsync();
    cQuery.vesting_shares = _.join(
      [
        formatter.vestToSteem(
          cQuery.vesting_shares,
          globalProps.total_vesting_shares,
          globalProps.total_vesting_fund_steem
        ).toFixed(3),
        'SP',
      ], ' ');
  } else if (amount && symbol === 'SP') {
    cQuery.vesting_shares = _.join(
      [parseFloat(amount).toFixed(3), symbol],
      ' ');
  }
  return cQuery;
};

module.exports = {
  normalize,
  optionalFields,
  parse,
  validate,
};
