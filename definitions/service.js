module.exports = function ({
  name,
  version,
  isHealthCheck = false,
  targetPort,
}) {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: isHealthCheck ? `${name}-${version}-health` : name,
    },
    spec: {
      type: 'ClusterIP',
      selector: {
        app: name,
        version,
      },
      ports: [
        {
          port: 80,
          targetPort,
        },
      ],
    },
  };
};
