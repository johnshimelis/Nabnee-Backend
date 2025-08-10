const killPort = require('kill-port');
require('dotenv').config();

const portToKill = process.env.PORT || 4000;

// Use the kill-port package which works cross-platform
killPort(portToKill)
  .then(() => {
    console.log(`Successfully killed process on port ${portToKill}`);
  })
  .catch(error => {
    // It's not a problem if no process was running on that port
    console.log(`No process was running on port ${portToKill} or failed to kill it: ${error.message}`);
  });
