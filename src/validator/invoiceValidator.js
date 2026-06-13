const invoiceValidator = {
  rules: {
    invoice_description: [
      {
        pattern: /^.+$/,
        message: 'description is required',
      },
      {
        pattern: /^.{0,50}$/,
        message: 'description must not be more than 50 characters',
      },
    ],
  },
  fields: {
    issueDate: new Date(),
    due_on: '',
    status: 'Unpaid',
    invoice_description: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    totalAmount: 0,
    notes: '',
    invoice_type: '',
  },
};


const itemValidator = {
  rules: {
    description: [
      {
        pattern: /^.+$/,
        message: 'description is required',
      },
      {
        pattern: /^.{0,50}$/,
        message: 'description must not be more than 50 characters',
      },
    ],
    date: [
      {
        pattern: /^.+$/,
        message: 'date is required',
      },
      {
        pattern: /^.{0,50}$/,
        message: 'date must not be more than 50 characters',
      },
    ],
    duration: [
      {
        pattern: /^\d+$/,
        message: 'duration is required',
      },
    ],
    rate: [
      {
        pattern: /^\d+$/,
        message: 'rate is required',
      },
    ],
  },
  reset: () => {
    return {
      _id: '',
      unit: '',
      description: '',
      duration: '',
      rate: '',
    };
  },
  fields: {
    _id: '',
    description: '',
    unit: '',
    duration: '',
    rate: '',
    date: '',
  },
};

export {invoiceValidator, itemValidator};
