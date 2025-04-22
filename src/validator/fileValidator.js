const fileValidator = {
    rules: {
      name: [
        { pattern: /^.+$/, message: 'Document name is required' },
        { pattern: /^.{0,50}$/, message: 'Document name must not exceed 100 characters' }
      ],
    },
    fields: {
      name: '',
      description: '',
      file: '',
      fileName: ''   
    }
  };

  export { fileValidator }