import React, {useState, useEffect} from 'react';
import {INVOICE, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {invoiceValidator} from '../validator/invoiceValidator';
import {INVOICES} from '../../assets/data/invoice';

const useInvoice = (flag = false) => {
  const [state, setState] = useState({
    data: INVOICES | [],
    loading: false,
    error: null,
    success: false,
    fields: invoiceValidator.fields,
    rules: invoiceValidator.rules,
  });

  const handleEditItem = invoice => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        ...invoice,
        issueDate: new Date(invoice.issueDate),
       
      },
    }));
  };

  const handleAddItem = newItem => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        items: [...prevState.fields.items, newItem],
      },
    }));
  };

  const handleDeleteItem = id => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        items: prevState.fields.items.filter(item => item._id !== id),
      },
    }));
  };

  const handleUpdateItem = (id, field, value) => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        items: prevState.fields.items.map(item => {
          if (item._id === id) {
            return {
              ...item,
              [field]:
                field === 'rate' || field === 'duration'
                  ? parseFloat(value) || 0
                  : value,
            };
          }
          return item;
        }),
      },
    }));
  };

  const handleChange = (name, value) => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: value,
      },
    }));
  };

  const handleError = error => {
    setState(pre => {
      return {
        ...pre,
        error: error,
        fields: invoiceValidator.fields,
        loading: false,
      };
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {
        ...pre,
        success: false,
        fields: invoiceValidator.fields,
        loading: false,
        error: null,
      };
    });
  };

  async function handleFetchInvoices() {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, data, errorMessage} = await zat(
      INVOICE.fetchMyInvoices,
      null,
      VERBS.GET,
      null,
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data?.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ),
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to fetch the invoice.');
      return false;
    }
  }

  const handleAddInvoice = async body => {
    const {success, errorMessage} = await zat(INVOICE.addOne, body, VERBS.POST);

    if (success) {
      setState(prevState => ({
        ...prevState,
        success: true,
        loading: false,
      }));

      return true;
    } else {
      handleError(errorMessage || 'Failed to adding invoice.');
      return false;
    }
  };

  async function handleEditInvoice(body, invoice_id) {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage} = await zat(
      INVOICE.updateOne,
      body,
      VERBS.PUT,
      {id: invoice_id},
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the invoice.');
      return false;
    }
  }

  const handleDelete = async invoice_id => {
    const {success, errorMessage} = await zat(
      INVOICE.removeOne,
      null,
      VERBS.DELETE,
      {
        id: invoice_id,
      },
    );

    if (success) {
      setState(pre => ({
        ...pre,
        data: pre.data.filter(invoice => invoice._id !== invoice_id),
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the invoice.');
      return false;
    }
  };

  useEffect(() => {
    flag && handleFetchInvoices();
  }, [flag]);

  return {
    ...state,
    handleDelete,
    handleAddInvoice,
    handleReset,
    onChange : handleChange,
    handleEditInvoice,
    handleUpdateItem,
    handleAddItem,
    handleDeleteItem,
    handleEditItem,
  };
};

export {useInvoice};
