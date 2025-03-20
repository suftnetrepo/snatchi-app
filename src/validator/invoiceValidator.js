import uuid from 'react-native-uuid';

const invoiceValidator = {
  rules: {
    text: {},
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
    invoice_type: false,
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
    hour: [
      {
        pattern: /^\d+$/,
        message: 'hour is required',
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
      _id:'',
      description: '',
      hour: '',
      rate: '',
    };
  },
  fields: {
    _id:'',
    description: '',
    hour: '',
    rate: '',
    date: '',
  },
};

export {invoiceValidator, itemValidator};
