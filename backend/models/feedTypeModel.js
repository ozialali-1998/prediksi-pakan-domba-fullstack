const { all, get } = require('./db');

const getAllFeedTypes = () => all('SELECT id, name FROM FeedTypes ORDER BY name ASC');

const getFeedTypeByName = (name) =>
  get('SELECT id, name FROM FeedTypes WHERE LOWER(name) = LOWER(?)', [name]);

module.exports = {
  getAllFeedTypes,
  getFeedTypeByName
};
