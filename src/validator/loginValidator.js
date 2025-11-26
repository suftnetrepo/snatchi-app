const loginValidator = {
    rules: {
      password: [
        {
          pattern: /^.+$/,
          message: 'password is required'
        },
        {
          pattern: /^.{0,20}$/,
          message: 'password must be no more than 20 characters'
        }
      ],
      email: [
        {
          pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'Please enter a valid email address'
        }
      ]
    },
    fields: {
      email: '',
      password : ''
    }
  }
  
  const forgotValidator = {
    rules: {    
      email: [
        {
          pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'Please enter a valid email address'
        }
      ]
    },
    fields: {
      email: ''   
    }
  }
  
  const verifyCodeValidator = {
    rules: {
      email: [
        {
          pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'Please enter a valid email address'
        }
      ],
      code: [
        {
          pattern: /^.+$/,
          message: 'code is required'
        },
        {
          pattern: /^.{0,50}$/,
          message: 'code must not be more than 8 characters'
        }
      ]
    },
    fields: {
      email: '',
      code : ''
    }
  }
  
  const passwordValidator = {
    rules: {
      password: [
        {
          pattern: /^.+$/,
          message: 'password is required'
        },
        {
          pattern: /^.{0,20}$/,
          message: 'password must be no more than 20 characters'
        }
      ],
    },
    fields: {
      password: ''
    }
  }

  const userValidator = {
    rules: {
      first_name: [
        {
          pattern: /^.+$/,
          message: 'first name is required'
        },
        {
          pattern: /^.{0,50}$/,
          message: 'first name must not be more than 50 characters'
        }
      ],
      last_name: [
        { pattern: /^.+$/, message: 'last name is required' },
        {
          pattern: /^.{0,50}$/,
          message: 'last name must not be more than 50 characters'
        }
      ],
      email: [
        { pattern: /.+/, message: 'email address is required' },
        {
          pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'Please enter a valid email address'
        },
        {
          pattern: /^.{0,50}$/,
          message: 'email address must not be more than 50 characters'
        }
      ],
      mobile: [
        { pattern: /^.+$/, message: 'mobile is required' },      
        {
          pattern: /^.{0,50}$/,
          message: 'mobile number must not be more than 20 characters'
        }
      ],
      role: [{ pattern: /^.+$/, message: 'role is required' }]
    },
    reset: () => {
      return {
        ...userValidator.fields
      }
  
    },
    fields: {
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      fcm: '',
      secure_url :'',
      role : ''
    }
  };
  
  export { forgotValidator, loginValidator, passwordValidator, verifyCodeValidator, userValidator }