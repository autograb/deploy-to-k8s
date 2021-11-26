module.exports = {
  // Cron Job
  cronjob: {
    required: ['schedule', 'command', 'image', 'restartPolicy'],
    strategy: 'cronjob',
  },
  job: {
    required: ['command', 'image', 'restartPolicy'],
    strategy: 'job',
  },
  web: {
    required: ['port', 'image'],
    strategy: 'blue-green',
  },
  worker: {
    required: ['image'],
    strategy: 'deployment',
  },
};
