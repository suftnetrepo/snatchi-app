const addressValidator = {
  rules: {
     addressLine1: [
      {
        pattern: /^.+$/,
        message: "street address is required",
      },
    ],
    addressline2: [
      {
        pattern: /^.+$/,
        message: "town is required",
      },
    ],
    country: [
      {
        pattern: /^.+$/,
        message: "country is required",
      },
    ],
  },
  fields: {
    addressline1: "",
    addressline2: "",
    addressline3: "",
    country_code: "",
    country: "",
    postcode: "",
    longitude: 0,
    latitude: 0,
    searchQuery : ""
  },
};

export  {
  addressValidator
}
