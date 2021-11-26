const { exec } = require('@actions/exec');
const yaml = require('json2yaml');
const definitions = require('./definitions');

async function cronjob() {
  console.error('Not yet implemented');
}

async function deployment() {
  console.error('Not yet implemented');
}

async function blueGreen({ name, version, envFrom, image, port, replicas }) {
  let existingDeployment = '';
  try {
    existingDeployment = await new Promise(async (resolve, reject) => {
      let out = '';
      let err = '';
      await exec(`kubectl get service ${name} -o json`, {
        silent: true,
        listeners: {
          stdout: (data) => {
            out += data.toString();
          },
          stderr: (data) => {
            err += data.toString();
          },
        },
      });

      if (err) {
        reject(err);
      } else {
        resolve(out);
      }
    });
  } catch (e) {
    console.error(`No existing deployment: ${e.message}`);
  }

  const newDeployment = definitions.deployment({
    name: `${name}-${version}`,
    image,
    envFrom,
    port,
    replicas,
  });

  // Create new deployment
  console.log(`🚀 Creating new deployment ${name}-${version}`);
  await exec(`kubectl apply -f -`, {
    input: yaml.stringify(newDeployment),
  });
  console.log(`🔃 Submitted deployment ${name}-${version}`);

  // Wait for new deployment to be ready
  console.log(`Awaiting deployment rollout for ${name}-${version}`);
  await exec(`kubectl rollout status deployment/${name}-${version}`);
  console.log(`✅ Deployment rollout complete for ${name}-${version}`);

  // Create healthcheck service for the new deployment
  const healthCheckService = definitions.service({
    name,
    version,
    isHealthCheck: true,
    targetPort: port,
  });

  console.log(`🚀 Creating healthcheck service for ${name}-${version}`);
  await exec(`kubectl apply -f -`, {
    input: yaml.stringify(healthCheckService),
  });
  console.log(`🔃 Submitted healthcheck service for ${name}-${version}`);

  try {
    // Health check the new service
    console.log(`🍗 Cooking chicken`);
    await exec(
      `kubectl run --rm --attach=true --restart=Never test-${healthCheckService.metadata.name} --image=curlimages/curl:latest -- --fail --retry 5 --retry-delay 5 http://${healthCheckService.metadata.name}/_health`
    );
  } catch {
    console.error(`🍗 Chicken is not ready`);
    await exec(`kubectl delete deployment ${name}-${version}`);
    await exec(`kubectl delete service ${healthCheckService.metadata.name}`);
    process.exit(1);
  }

  // Switch traffic to the new service
  console.log(`🔃 Switching traffic to ${name}-${version}`);
  const service = definitions.service({
    name,
    version,
    targetPort,
  });
  await exec(`kubectl apply -f -`, {
    input: yaml.stringify(service),
  });
  console.log(`🔃 Submitted traffic switch ${name}-${version}`);
  try {
    // Health check the new service
    console.log(`🥩 Cooking steak`);
    await exec(
      `kubectl run --rm --attach=true --restart=Never test-${service.metadata.name} --image=curlimages/curl:latest -- --fail --retry 5 --retry-delay 5 http://${service.metadata.name}/_health`
    );
    console.log(`✅ New service is healthy`);
  } catch {
    console.error(`🥩 Steak is not ready`);
    if (existingDeployment) {
      await exec(`kubectl delete deployment ${name}-${version}`);
      console.log(`🔃 Switching traffic back to existing service`);
      await exec(`kubectl apply -f -`, {
        input: yaml.stringify(JSON.parse(existingDeployment)),
      });
    }
    process.exit(1);
  }

  // Delete the old deployment
  if (existingDeployment) {
    const oldDeployment = JSON.parse(existingDeployment);
    console.log(
      `🔃 Deleting old deployment ${oldDeployment.spec.selector.app}-${oldDeployment.spec.selector.version}`
    );
    await exec(
      `kubectl delete deployment ${oldDeployment.spec.selector.app}-${oldDeployment.spec.selector.version}`
    );
    console.log(
      `🔃 Submitted deletion of old deployment ${oldDeployment.spec.selector.app}-${oldDeployment.spec.selector.version}`
    );
  }

  console.log(`✅ Successfully deployed ${name} at version ${version}`);
}

async function job() {
  console.error('Not yet implemented');
}

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
