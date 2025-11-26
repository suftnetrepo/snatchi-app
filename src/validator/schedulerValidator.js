const schedulerValidator = {
  rules: {
    title: [
      {pattern: /^.+$/, message: 'title is required'},
      {pattern: /^.{0,250}$/, message: 'title must not exceed 100 characters'},
    ],
     status :[{
        pattern: /^.+$/,
        message: 'status is required',
      }],
  },
  reset: () => {
    return {
      title: '',
      status: '',
      startDate: '',
      endDate: '',
      description: '',
    };
  },
  fields: {
    description: '',
    status: '',
    startDate: '',
    endDate: '',
    title: '',
    user: '',
  },
};

export { schedulerValidator};
