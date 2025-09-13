const fileValidator = {
    rules: {
      document_name: [
        { pattern: /^.+$/, message: 'Document description is required' },
        { pattern: /^.{0,50}$/, message: 'Document description must not exceed 100 characters' }
      ],
    },
    fields: {
      document_type: '',
      document_name: '',
      file: '',
      fileName: ''   
    }
  };

  export { fileValidator }