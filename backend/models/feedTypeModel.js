const { all, get, run } = require('./db');

const getAllFeedTypes = () =>
  all('SELECT id, name, protein, energy FROM FeedTypes ORDER BY name ASC');

const getFeedTypeById = (id) =>
  get('SELECT id, name, protein, energy FROM FeedTypes WHERE id = ?', [id]);

const createFeedType = async ({ name, protein, energy }) => {
  const result = await run(
    'INSERT INTO FeedTypes (name, protein, energy) VALUES (?, ?, ?)',
    [name, protein, energy]
  );

  return getFeedTypeById(result.id);
};

module.exports = {
  getAllFeedTypes,
  getFeedTypeById,
  createFeedType
};
