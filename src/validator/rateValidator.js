const rateValidator = {
  rules: {
    serviceName: [
      {
        pattern: /^.+$/,
        message: 'service name is required',
      },
      {
        pattern: /^.{0,50}$/,
        message: 'service name must not be more than 50 characters',
      },
    ],
    rate: [
      {
        pattern: /^\d+$/,
        message: 'rate is required',
      },
    ],
  },
  fields: {
    rateType: '',
    rate: '',
    serviceName: '',
    description: '',

  },
};
export { rateValidator };