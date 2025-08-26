const schedulerValidator = {
  rules: {
    title: [
      {pattern: /^.+$/, message: 'Title is required'},
      {pattern: /^.{0,250}$/, message: 'Title must not exceed 100 characters'},
    ],
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

export {schedulerValidator};
