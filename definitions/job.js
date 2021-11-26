module.exports = function ({ name, image, command, attempts = 1 }) {
  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name,
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name,
              image,
              command: command.split(/\s+/),
            },
          ],
          restartPolicy: 'Never',
        },
      },
      backoffLimit: attempts,
    },
  };
};
