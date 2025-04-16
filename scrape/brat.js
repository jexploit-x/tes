const axios = require('axios');
const cheerio = require('cheerio');

async function bratScraper() {
  const res = await axios.get('https://brat.ai/');
  const $ = cheerio.load(res.data);
  const emojis = [];

  $('div.emoji-item').each((i, el) => {
    const emoji = $(el).find('span.emoji').text();
    const name = $(el).find('span.name').text();
    if (emoji && name) {
      emojis.push({ name, emoji });
    }
  });

  return emojis;
}

module.exports = bratScraper;
