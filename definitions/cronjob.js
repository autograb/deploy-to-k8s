module.exports = function ({ schedule, name, image, command }) {
  return {
    apiVersion: 'batch/v1',
    kind: 'CronJob',
    metadata: {
      name,
    },
    spec: {
      schedule,
      jobTemplate: {
        spec: {
          template: {
            spec: {
              containers: [
                {
                  name,
                  image,
                  imagePullPolicy: 'IfNotPresent',
                  command: command.split(/\s+/),
                },
              ],
              restartPolicy: 'OnFailure',
            },
          },
        },
      },
    },
  };
};
