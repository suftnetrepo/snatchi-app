const addressValidator = {
  rules: {
     addressLine1: [
      {
        pattern: /^.+$/,
        message: "street address is required",
      },
    ],
    town: [
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
    addressLine1: "",
    town: "",
    county: "",
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
