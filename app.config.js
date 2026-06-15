const appJson = require('./app.json');

require('dotenv').config();

module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      API_BASE: process.env.API_BASE || 'http://localhost:3000',
    },
  },
});
