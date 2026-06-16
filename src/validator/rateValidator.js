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
    rateType: [
      {
        pattern: /^.+$/,
        message: 'rate type is required',
      },
      {
        pattern: /^.{0,50}$/,
        message: 'rate type must not be more than 50 characters',
      },
    ],
    rate: [
        {
        pattern: /^.+$/,
        message: 'rate is required',
      },    
      {
        pattern: /^\d+$/,
        message: 'rate must be a number',
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