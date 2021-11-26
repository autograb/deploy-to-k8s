const { execSync } = require('child_process');
const core = require('@actions/core');
const definitions = require('./definitions');
const strategies = require('./strategies');

const gitCommitId = execSync('git rev-parse HEAD')
  .toString()
  .trim()
  .slice(0, 10);

const fields = {
  version: gitCommitId,
  name: core.getInput('name'),
  type: core.getInput('type'),
  image: core.getInput('image'),
  schedule: core.getInput('schedule'),
  command: core.getInput('command'),
  port: core.getInput('port'),
  envFrom: core.getInput('envFrom'),
  replicas: core.getInput('replicas'),
};

(async () => {
  const definition = definitions[fields.type];

  if (!definition) {
    throw new Error(`Unknown deployment type: ${fields.type}`);
  }

  const { strategy, required } = definition;

  for (const field of required) {
    if (!fields[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return strategies(strategy, fields);
})();
