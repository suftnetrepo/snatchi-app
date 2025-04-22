/* eslint-disable prettier/prettier */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable prettier/prettier */
import {faker} from '@faker-js/faker';
import {theme} from './theme';

export const isValidColor = value =>
  /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(value);
export const isValidNumber = value =>
  typeof value === 'number' && isFinite(value);
export const isValidString = value =>
  typeof value === 'string' && value.trim().length > 0;

const generateRandomData = () => {
  return {
    name: faker.company.name(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    user_name: faker.internet.userName(),
    email: faker.internet.email(),
    mobile: faker.phone.number().slice(0, 12),
    password: '1234567',
    address: faker.location.streetAddress(),
    role: 'admin',
    pass_code: 1234,
  };
};

const toWordCase = str => {
  return str?.toLowerCase().replace(/(^|\s)\S/g, t => t?.toUpperCase());
};

const getGreetings = () => {
  const currentTime = new Date().getHours();
  let greeting;

  if (currentTime < 12) {
    greeting = 'Good morning';
  } else if (currentTime < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }

  return greeting;
};

const dateConverter = (stringDate, reverse = true) => {
  if (!stringDate) return;
  const date = new Date(stringDate);

  if (reverse)
    return date.toISOString().split('T')[0]?.split('-').reverse().join('-');
  return date.toISOString().split('T')[0]?.split('-').join('-');
};

const shortDateConverter = stringDate => {
  if (!stringDate) return;

  const date = new Date(stringDate);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dayOfWeek = days[date.getUTCDay()];
  const dayOfMonth = date.getUTCDate();
  const month = months[date.getUTCMonth()];

  return `${dayOfWeek}, ${dayOfMonth} ${month}`;
};

const timeConverter = stringDate => {
  const date = new Date(stringDate);

  // Extract hours, minutes, and seconds
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // Determine AM or PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  hours = hours % 12 || 12;
  hours = hours.toString().padStart(2, '0');

  // Return formatted time string
  return `${hours}:${minutes} ${period}`;
};

function formatDateTime(dateTimeString) {
  const [datePart, timePart] = dateTimeString.split('T');
  const formattedDate = datePart?.split('-').reverse().join('-');
  const formattedTime = timePart?.split('.')[0];

  return `${formattedDate} ${formattedTime}`;
}

function formatCurrency(currencySymbol, amount) {
  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount)) {
    return amount;
  }

  const formattedAmount =
    currencySymbol +
    numericAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

  return formattedAmount;
}

function currencySymbolMapper(currencySymbol) {
  const currencyMap = {
    '£': 'gbp',
    $: 'usd',
    aed: 'aed',
    afn: 'afn',
    all: 'all',
    amd: 'amd',
    usdc: 'usdc',
    btn: 'btn',
    ghs: 'ghs',
    eek: 'eek',
    lvl: 'lvl',
    svc: 'svc',
    vef: 'vef',
    ltl: 'ltl',
    sll: 'sll',
  };

  if (currencySymbol in currencyMap) {
    return currencyMap[currencySymbol];
  } else {
    return 'gbp';
  }
}

function generatePaymentId() {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < 15; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function guid() {
  var timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  return (
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase()
  );
}

function calculateVaccineCompletion(data) {
  const totalCount = data.length;
  let completedCount = 0;
  let notCompletedCount = 0;

  data.forEach(record => {
    if (record.status === 1) {
      completedCount++;
    } else if (record.status === 0) {
      notCompletedCount++;
    }
  });

  const completedPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const notCompletedPercentage =
    totalCount > 0 ? (notCompletedCount / totalCount) * 100 : 0;

  return {
    completedPercentage,
    notCompletedPercentage,
    count: data.length,
    completedCount,
    notCompletedCount,
  };
}
const timeStampConverter = (timestamp, localFormat = 'en-GB') => {
  const formattedDate = new Date(parseInt(timestamp));
  return dateConverter(formattedDate.toLocaleDateString(localFormat));
};
function formatTimeFromTimestamp(timestampMs) {
  if (!timestampMs) return;
  // Create a Date object using the timestamp
  const date = new Date(timestampMs);

  // Choose the appropriate methods based on whether local time or UTC time is needed
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // const seconds = localTime ? date.getSeconds() : date.getUTCSeconds();

  // Format hours, minutes, and seconds with leading zeros if needed
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  // const formattedSeconds = seconds.toString().padStart(2, '0');

  // Return the formatted time string
  return `${formattedHours}:${formattedMinutes}`;
}
function formatTimeFromDate(dateTime) {
  if (!dateTime) return '';

  const date = new Date(dateTime);

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const isPM = hours >= 12;
  const hours12 = hours % 12 || 12;
  const ampm = isPM ? 'PM' : 'AM';

  const formattedHours = hours12.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

function adjustColor(hex, amount) {
  // Ensure hex color starts with #
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }

  // Convert hex to RGB
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  // Adjust color components
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));

  // Convert back to hex
  const toHex = value => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function generateShades(hex) {
  // Lighten and darken by 20%

  const lightAmount = 170; // Adjust this value for lighter shades
  const darkAmount = 32; // Slightly darken the color

  const lighter = adjustColor(hex, lightAmount);
  const darker = adjustColor(hex, -darkAmount);

  return {lighter, darker};
}
function addTimeToCurrentDate(timeStr) {
  const now = new Date();
  if (timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    if (
      hours >= 0 &&
      hours < 24 &&
      minutes >= 0 &&
      minutes < 60 &&
      seconds >= 0 &&
      seconds < 60
    ) {
      now.setHours(now.getHours() + hours);
      now.setMinutes(now.getMinutes() + minutes);
      now.setSeconds(now.getSeconds() + seconds);
    }
  }

  return now;
}
function addDayToDate(startDate, day = 30) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + parseInt(day));
  return endDate;
}
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
function removeQuotes(strDate) {
  return strDate.replace(/^"|"$/g, '');
}
function formatTimeToAMPM(timeStr) {
  if (!timeStr) return;
  const [hours, minutes] = timeStr?.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const formattedMinutes = minutes?.toString()?.padStart(2, '0');
  return `${hours12}:${formattedMinutes} ${period}`;
}

const backgroundColorHelper = status => {
  switch (status) {
    case 'Progress':
      return theme.colors.amber[100];
    case 'Completed':
    case 'Paid':
      return theme.colors.green[100];
    case 'Pending':
    case 'Unpaid':
      return theme.colors.indigo[100];
    case 'Cancelled':
      return theme.colors.red[100];
    default:
      return theme.colors.gray[100];
  }
};

const textColorHelper = status => {
  switch (status) {
    case 'Progress':
      return theme.colors.amber[800];
    case 'Completed':
    case 'Paid':
      return theme.colors.green[800];
    case 'Pending':
    case 'Unpaid':
      return theme.colors.indigo[800];
    case 'Cancelled':
      return theme.colors.red[800];
    default:
      return theme.colors.gray[800];
  }
};

const priorityBackgroundColorHelper = priority => {
  switch (priority) {
    case 'High':
      return theme.colors.pink[100];
    case 'Medium':
      return theme.colors.amber[100];
    case 'Low':
      return theme.colors.indigo[100];
    default:
      return theme.colors.gray[100];
  }
};

const priorityTextColorHelper = priority => {
  switch (priority) {
    case 'High':
      return theme.colors.pink[800];
    case 'Medium':
      return theme.colors.amber[800];
    case 'Low':
      return theme.colors.indigo[800];
    default:
      return theme.colors.gray[800];
  }
};

const taskStatusArray = [
  {label: 'Pending', value: 'Pending'},
  {label: 'Progress', value: 'Progress'},
  {label: 'Completed', value: 'Completed'},
  {label: 'Canceled', value: 'Canceled'},
];

const personalDocumentsArray = [
  { label: 'NI Number / Social Security', value: 'NINumber' },
  { label: 'Passport', value: 'Passport' },
  { label: 'Driver’s License', value: 'DriversLicense' },
  { label: 'Work Permit / Visa', value: 'WorkPermit' },
  { label: 'Professional Certificates', value: 'ProfessionalCertificates' },
  { label: 'ID Card', value: 'IDCard' },
  { label: 'Proof of Address', value: 'ProofOfAddress' },
  { label: 'CV / Resume', value: 'CVResume' },
  { label: 'DBS / Background Check', value: 'BackgroundCheck' },
  { label: 'Emergency Contact Info', value: 'EmergencyContactInfo' },
  { label: 'Medical Fitness Certificate', value: 'MedicalFitnessCertificate' },
  { label: 'Insurance Certificate', value: 'InsuranceCertificate' },
  { label: 'Vaccination Record', value: 'VaccinationRecord' },
];

const timeAgo = date => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just Now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60)
    return `${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'} Ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'Hour' : 'Hours'} Ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'Day' : 'Days'} Ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'} Ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'Month' : 'Months'} Ago`;
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'Year' : 'Years'} Ago`;
};

const colorPalettes = {
  rose: ['#e11d48', '#be123c'],
  pink: ['#db2777', '#be185d'],
  fuchsia: ['#c026d3', '#a21caf'],
  purple: ['#9333ea', '#7e22ce'],
  violet: ['#7c3aed', '#6d28d9'],
  indigo: ['#4f46e5', '#4338ca'],
  blue: ['#2563eb', '#1d4ed8'],
  lightBlue: ['#0284c7', '#0369a1'],
  darkBlue: ['#005db4', '#004282'],
  cyan: ['#0891b2', '#0e7490'],
  teal: ['#0d9488', '#0f766e'],
  emerald: ['#059669', '#047857'],
  green: ['#16a34a', '#15803d'],
  lime: ['#65a30d', '#4d7c0f'],
  yellow: ['#ca8a04', '#a16207'],
  amber: ['#d97706', '#b45309'],
  orange: ['#ea580c', '#c2410c'],
  red: ['#dc2626', '#b91c1c'],
  warmGray: ['#57534e', '#44403c'],
  trueGray: ['#525252', '#404040'],
  gray: ['#52525b', '#3f3f46'],
  coolGray: ['#4b5563', '#374151'],
  blueGray: ['#475569', '#334155'],
};

const randomColor = () => {
  const colors = Object.values(colorPalettes);
  const randomPalette = colors[Math.floor(Math.random() * colors.length)];
  return randomPalette[Math.floor(Math.random() * randomPalette.length)];
};

function formatReadableDate(isoDate) {
  const date = new Date(isoDate);
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  return date.toLocaleDateString('en-US', options);
}

function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);

  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  const result =
    distance > 1
      ? `${distance.toFixed(2)} km`
      : `${Math.round(distance * 1000)} meters`;
  return result;
}

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return;
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

export {
  haversineDistance,
  priorityBackgroundColorHelper,
  priorityTextColorHelper,
  shortDateConverter,
  formatTimeToAMPM,
  removeQuotes,
  formatDate,
  addDayToDate,
  addTimeToCurrentDate,
  formatTimeFromDate,
  generateShades,
  formatTimeFromTimestamp,
  timeStampConverter,
  calculateVaccineCompletion,
  guid,
  formatDateTime,
  timeConverter,
  getGreetings,
  generatePaymentId,
  currencySymbolMapper,
  generateRandomData,
  toWordCase,
  formatCurrency,
  dateConverter,
  backgroundColorHelper,
  textColorHelper,
  taskStatusArray,
  timeAgo,
  randomColor,
  formatReadableDate,
  convertTimestampToDate,
  personalDocumentsArray
};
