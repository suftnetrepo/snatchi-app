const normalizeBaseUrl = value => `${String(value || '').replace(/\/+$/, '')}/`;

//const BASE_HOST_ADDRESS = 'http://192.168.1.74:3000/';
const BASE_HOST_ADDRESS = 'https://snatchi-web.onrender.com/';
const HOST_ADDRESS = BASE_HOST_ADDRESS;
const HOST_API_ADDRESS = normalizeBaseUrl(`${BASE_HOST_ADDRESS}api`);

// END POINTS

export const NOTIFICATION = {
  removeOne: `${HOST_API_ADDRESS}notifications`,
  updateOne: `${HOST_API_ADDRESS}notifications`,
  fetch: `${HOST_API_ADDRESS}notifications`,
  fetchUnReadCount: `${HOST_API_ADDRESS}notifications/unread-count`,
};

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

export const RATE = {
  addOne: `${HOST_API_ADDRESS}engineer-service-rate`,
  updateOne: `${HOST_API_ADDRESS}engineer-service-rate`,
  removeOne: `${HOST_API_ADDRESS}engineer-service-rate`,
  fetchMyRates: `${HOST_API_ADDRESS}engineer-service-rate?action=list`,
};

export const SCHEDULER = {
  createOne: `${HOST_API_ADDRESS}scheduler`,
  updateOne: `${HOST_API_ADDRESS}scheduler`,
  updatestatus: `${HOST_API_ADDRESS}scheduler/`,
  removeOne: `${HOST_API_ADDRESS}scheduler`,
  getByUser: `${HOST_API_ADDRESS}scheduler`,
  getEngineerSchedules: `${HOST_API_ADDRESS}scheduler`,
  getSchedulesByEngineer: `${HOST_API_ADDRESS}scheduler`,
  engineerStatusAggregate: `${HOST_API_ADDRESS}scheduler`,
  getUnreadByEngineer: `${HOST_API_ADDRESS}scheduler`,
  markAsRead: `${HOST_API_ADDRESS}scheduler`,
};

export const USER_HOST_ADDRESS = {
  updateOne: `${HOST_API_ADDRESS}user`,
  updateFcm: `${HOST_API_ADDRESS}user/fcm`,
  changePassword: `${HOST_API_ADDRESS}user`,
  removeOne: `${HOST_API_ADDRESS}user/`,
  getById: `${HOST_API_ADDRESS}user/`,
    updateAddress: `${HOST_API_ADDRESS}user/`,
 }

export const USER_DOCUMENTS = {
  uploadOne: `${HOST_API_ADDRESS}user/document`,
  addOne: `${HOST_API_ADDRESS}user/document`,
  fetch: `${HOST_API_ADDRESS}user/document`,
  removeOne: `${HOST_API_ADDRESS}user/document`,

};

export const FENCE = {
  addOne: `${HOST_API_ADDRESS}fence`,
  fetch: `${HOST_API_ADDRESS}fence`,
  removeOne: `${HOST_API_ADDRESS}fence/`
};

export const PROJECT = {
  recent: `${HOST_API_ADDRESS}project/`,
  uploadOne: `${HOST_API_ADDRESS}project_document`,
};

export const USER_HOST_USER_STATUS = {
  action: `${HOST_API_ADDRESS}user/status`,
 }

export const VERBS = {
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT',
  PATCH: 'PATCH'
};

const CLOUDINARY_CLOUD_NAME = 'dwjjtakfs';
const CLOUDINARY_UPLOAD_PRESET = 'uo6l2ljb_realse_client_preset';
const CLOUDINARY_UPLOAD_URL =
  "https://api.cloudinary.com/v1_1/dwjjtakfs/image/upload";

export {
  HOST_ADDRESS,
  HOST_API_ADDRESS,
  CLOUDINARY_UPLOAD_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET
};
