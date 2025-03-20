const taskCommentValidator = {
    rules: {
      text: [
        { pattern: /^.+$/, message: 'Comment is required' },
        { pattern: /^.{0,250}$/, message: 'Comment must not exceed 250 characters' }
      ],
    },
    fields: {
      text: ''
    }
  };

  export { taskCommentValidator }