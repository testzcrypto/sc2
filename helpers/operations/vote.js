const _ = require('lodash');
const { contentExists } = require('../validation-utils');

const optionalFields = ['weight'];

const parse = (query) => {
  const cQuery = _.cloneDeep(query);
  cQuery.weight = cQuery.weight || 10000;
  return cQuery;
};

const validate = async (query, errors) => {
  if (errors.length === 0 && !await contentExists(query.author, query.permlink)) {
    errors.push('the post doesn\'t exist');
  }
};

module.exports = {
  optionalFields,
  parse,
  validate,
};
