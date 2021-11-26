const axios = require('axios');

module.exports = function healthcheck(url) {
  let attempts = 0;
  const attempt = async () => {
    try {
      attempt += 1;
      await axios.get(url, {
        timeout: 5000,
      });
    } catch {
      if (attempts < 5) {
        return attempt();
      }
      throw new Error('Failed to connect to server');
    }
  };

  return attempt();
};
