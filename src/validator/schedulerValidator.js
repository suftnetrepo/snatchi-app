const schedulerValidator = {
  rules: {
    title: [
      {pattern: /^.+$/, message: 'Title is required'},
      {pattern: /^.{0,250}$/, message: 'Title must not exceed 100 characters'},
    ],
    status: [{pattern: /^.+$/, message: 'Status is required'}],
    startDate: [
      {pattern: /^.+$/, message: 'Start date is required'},
      {
        validate: (value, fields) => {
          if (fields?.endDate && new Date(value) > new Date(fields?.endDate)) {
            return 'Start date cannot be after end date';
          }
          return undefined;
        },
      },
    ],
    endDate: [
      {pattern: /^.+$/, message: 'End date is required'},
      {
        validate: (value, fields) => {
          if (
            fields.startDate &&
            new Date(value) < new Date(fields.startDate)
          ) {
            return 'End date cannot be before start date';
          }
          return undefined;
        },
      },
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
