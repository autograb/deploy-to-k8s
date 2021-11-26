module.exports = function envFrom({ secretRef }) {
  return [
    {
      secretRef: {
        name: secretRef,
      },
    },
  ];
};
