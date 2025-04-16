const bratScraper = require('../scrape/brat');

module.exports = async (req, res) => {
  try {
    const data = await bratScraper();
    res.json({
      status: true,
      creator: 'jexploit-x',
      result: data
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};
