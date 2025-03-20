const fileValidator = {
    rules: {
      document_name: [
        { pattern: /^.+$/, message: 'Document title is required' },
        { pattern: /^.{0,50}$/, message: 'Document title must not exceed 100 characters' }
      ],
    },
    fields: {
      document_name: '',
      document_type: 'image',
      file: '',
      fileName: ''   
    }
  };

  export { fileValidator }