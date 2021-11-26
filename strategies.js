const k8s = require('./k8s');

async function cronjob() {}

async function deployment() {}

async function blueGreen() {}

async function job() {}

module.exports = function ({ strategy, ...context }) {
  switch (strategy) {
    case 'cronjob':
      return cronjob(context);
    case 'deployment':
      return deployment(context);
    case 'blue-green':
      return blueGreen(context);
    case 'job':
      return job(context);
    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
};
