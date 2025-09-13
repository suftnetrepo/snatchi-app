//LIVE

// STAGING
const HOST_ADDRESS = "https://snatchi-web.onrender.com/";
// const HOST_API_ADDRESS = "https://snatchi-web.onrender.com/api/";
const HOST_API_ADDRESS = "http://192.168.1.40:3000/api/";

// END POINTS

export const ACCOUNT_HOST_ADDRESS = {
  login: `${HOST_API_ADDRESS}auth/login`,
  logout: `${HOST_API_ADDRESS}auth/logout`,
  forgot: `${HOST_API_ADDRESS}mobile_auth/forgot`,
  verify: `${HOST_API_ADDRESS}mobile_auth/verifyMobile`
}

export const INVOICE = {
  addOne: `${HOST_API_ADDRESS}invoice`,
  updateOne: `${HOST_API_ADDRESS}invoice`,
  removeOne: `${HOST_API_ADDRESS}invoice`,
  fetchMyInvoices: `${HOST_API_ADDRESS}invoice?action=myInvoices`,
};

export const SCHEDULER = {
  createOne: `${HOST_API_ADDRESS}scheduler`,
  updateOne: `${HOST_API_ADDRESS}scheduler`,
  updatestatus: `${HOST_API_ADDRESS}scheduler`,
  removeOne: `${HOST_API_ADDRESS}scheduler`,
  getByUser: `${HOST_API_ADDRESS}scheduler`,
};

export const TASK_COMMENTS = {
  addOne: `${HOST_API_ADDRESS}task_comment`,
  fetch: `${HOST_API_ADDRESS}task_comment/`,
  removeOne: `${HOST_API_ADDRESS}task_comment/`
};

export const USER_HOST_ADDRESS = {
  updateOne: `${HOST_API_ADDRESS}user`,
  changePassword: `${HOST_API_ADDRESS}user`,
  removeOne: `${HOST_API_ADDRESS}user/`,
  getById: `${HOST_API_ADDRESS}user/`,
 }

 export const MYTASK_HOST_ADDRESS = {
  myTasks: `${HOST_API_ADDRESS}task`,
  updateOne: `${HOST_API_ADDRESS}task`,
  aggregate: `${HOST_API_ADDRESS}task?action=aggregate`,
 }
 
 export const TASK_DOCUMENT = {
  uploadOne: `${HOST_API_ADDRESS}task_document`,
  fetch: `${HOST_API_ADDRESS}task_document/`,
  removeOne: `${HOST_API_ADDRESS}task_document/`
}

export const USER_DOCUMENTS = {
  uploadOne: `${HOST_API_ADDRESS}user/document`,
  addOne: `${HOST_API_ADDRESS}user/document`,
  fetch: `${HOST_API_ADDRESS}user/document`,
  removeOne: `${HOST_API_ADDRESS}user/document`
};

export const ATTENDANCE = {
  addOne: `${HOST_API_ADDRESS}attendance`,
  fetch: `${HOST_API_ADDRESS}attendance`,
  removeOne: `${HOST_API_ADDRESS}attendance/`
};

export const USER_HOST_USER_STATUS = {
  action: `${HOST_API_ADDRESS}user/status`,
 }

export const VERBS = {
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT'
};

const CLOUDINARY_CLOUD_NAME = "dwjjtakfs";
const CLOUDINARY_API_KEY = 992935722916518;
const CLOUDINARY_API_SECRET = "C07VzBp8zn8A5NlZ9QcELB-B25w";
const CLOUDINARY_UPLOAD_PRESET = "uo6l2ljb_realse_client_preset";
const CLOUDINARY_UPLOAD_URL =
  "https://api.cloudinary.com/v1_1/dwjjtakfs/image/upload";

export {
  HOST_ADDRESS,
  HOST_API_ADDRESS,
  CLOUDINARY_UPLOAD_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_PRESET
};
