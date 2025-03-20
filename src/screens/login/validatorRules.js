/* eslint-disable prettier/prettier */
// Sample validation rules for a registration form
const validatorRules = {
  rules: {
    user_name: [
      {
        pattern: /^.+$/,
        message: 'email address is required'
      },
      {
        pattern: /^.{0,50}$/,
        message: 'email address must be no more than 50 characters'
      }
    ]
  },
  fields: {  
    user_name: '',   
    password: ''
  }
}

export { validatorRules }