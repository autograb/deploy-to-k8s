module.exports = function ({
  name,
  version,
  envFrom,
  image,
  port,
  replicas = 1,
}) {
  const app = `${name}-${version}`;

  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: app,
      labels: {
        app: name,
        version,
      },
    },
    spec: {
      replicas,
      selector: {
        matchLabels: {
          app: name,
          version,
        },
      },
      strategy: {
        rollingUpdate: {
          maxSurge: 1,
          maxUnavailable: 1,
        },
      },
      minReadySeconds: 5,
      template: {
        metadata: {
          labels: {
            app: name,
            version,
          },
        },
        spec: {
          containers: [
            {
              name,
              image,
              ...(envFrom ? { envFrom } : {}),
              ...(port ? { ports: [{ containerPort: port }] } : {}),
              resources: {
                requests: {
                  memory: '512Mi',
                  cpu: '500m',
                },
                limits: {
                  memory: '2048Mi',
                  cpu: '1000m',
                },
              },
            },
          ],
        },
      },
    },
  };
};
