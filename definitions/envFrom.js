module.exports = function ({ secretRef }) {
  return [
    {
      secretRef: {
        name: secretRef,
      },
    },
  ];
};
