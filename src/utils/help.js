import {faker} from '@faker-js/faker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
  if (dateTimeString === null || dateTimeString === undefined) return '';
  const [datePart, timePart] = dateTimeString?.split('T');
  const formattedDate = datePart?.split('-').reverse().join('-');
  const formattedTime = timePart?.split('.')[0].slice(0, 5);

  return `${formattedDate} ${formattedTime}`;
}

function formatOnlyDate(dateTimeString) {
  if (dateTimeString === null || dateTimeString === undefined) return '';
  const [datePart, timePart] = dateTimeString?.split('T');
  const formattedDate = datePart?.split('-').reverse().join('-');
  const formattedTime = timePart?.split('.')[0].slice(0, 5);

  return `${formattedDate}`;
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

const getPriorityColor = priority => {
  switch (priority) {
    case 'High':
      return '#0EA5E9';
    case 'Medium':
      return '#F472B6';
    case 'Low':
      return '#F59E0B';
    default:
      return '#9CA3AF';
  }
};

const taskStatusArray = [
  {label: 'Pending', value: 'Pending'},
  {label: 'Progress', value: 'Progress'},
  {label: 'Completed', value: 'Completed'},
  {label: 'Canceled', value: 'Canceled'},
];

const statusOptions = {
  empty: [
    {label: 'Select...', value: ''},
    {label: 'Lock', value: 'Lock'},
  ],
  pending: [
    {label: 'Select...', value: ''},
    {label: 'Declined', value: 'Declined'},
    {label: 'Accepted', value: 'Accepted'},
  ],
  invoice: [
    {label: 'Select...', value: ''},
    {label: 'Draft', value: 'Draft'},
    {label: 'Save', value: 'Save'},
    {label: 'Quote', value: 'Quote'},
  ],
};

const personalDocumentsArray = [
  {label: 'NI Number / Social Security', value: 'NINumber'},
  {label: 'Passport', value: 'Passport'},
  {label: 'Driver’s License', value: 'DriversLicense'},
  {label: 'Work Permit / Visa', value: 'WorkPermit'},
  {label: 'Professional Certificates', value: 'ProfessionalCertificates'},
  {label: 'ID Card', value: 'IDCard'},
  {label: 'Proof of Address', value: 'ProofOfAddress'},
  {label: 'CV / Resume', value: 'CVResume'},
  {label: 'DBS / Background Check', value: 'BackgroundCheck'},
  {label: 'Emergency Contact Info', value: 'EmergencyContactInfo'},
  {label: 'Medical Fitness Certificate', value: 'MedicalFitnessCertificate'},
  {label: 'Insurance Certificate', value: 'InsuranceCertificate'},
  {label: 'Vaccination Record', value: 'VaccinationRecord'},
];

const jobPhotoCategories = [
  {label: 'Completed Installation', value: 'CompletedInstallation'},
  {label: 'Before Work Started', value: 'BeforeWork'},
  {label: 'Work in Progress', value: 'WorkInProgress'},
  {label: 'After Work Finished', value: 'AfterWork'},
  {label: 'Equipment Setup', value: 'EquipmentSetup'},
  {label: 'Cabling / Wiring', value: 'CablingWiring'},
  {label: 'Rack / Control Room', value: 'RackRoom'},
  {label: 'Room Overview', value: 'RoomOverview'},
  {label: 'Defect / Issue Found', value: 'DefectIssue'},
  {label: 'Other (General Photo)', value: 'Other'},
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

const convertTimestampToDate = timestamp => {
  if (!timestamp) return;
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
  );
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const isSameDay = (storedDate, currentDate) => {
  return (
    storedDate.getFullYear() === currentDate.getFullYear() &&
    storedDate.getMonth() === currentDate.getMonth() &&
    storedDate.getDate() === currentDate.getDate()
  );
};

function formatMessageTimestamp(timestamp) {
  if (!timestamp || typeof timestamp.seconds !== 'number') {
    return '';
  }

  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
  );
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const isThisWeek = now - date < 7 * 24 * 60 * 60 * 1000;

  if (isToday) {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  if (isYesterday) {
    return 'Yesterday';
  }

  if (isThisWeek) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[date.getDay()];
  }

  return date.toLocaleDateString();
}

function getRelativeTimeString(timestamp) {
  let date;

  // Handle Firestore timestamp format
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    date = new Date(
      timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000,
    );
  }
  // Handle millisecond timestamp
  else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  }
  // Handle Date object or string
  else {
    date = new Date(timestamp);
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    // Less than 7 days
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    // Format as readable date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const truncate = (str, max = 100) =>
  str?.length > max ? str.slice(0, max) + '…' : str;

function toModel(event) {
  const now = new Date();
  const time = now.toISOString().substring(11, 16);

  return {
    integrator: event.integrator,
    user: event.userId,
    project: event.projectId,
    date: now,
    siteName: event.siteName,
    radius: event.radius || 200,
    first_name: event.firstName,
    last_name: event.lastName,
    time,
    status: event.transition === 'ENTER' ? 'Enter' : 'Exit',
    completeAddress: event.completeAddress,
    latitude: String(event.latitude),
    longitude: String(event.longitude),
  };
}

function formatShortDate(input) {
  if (!input) return '';
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${year}`;
}

function formatShortDateYYYMMD(input) {
  if (!input) return '';
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const getStatusTheme = status => {
  switch (status) {
    case 'Pending':
      return {bg: '#FFF5E1', badge: '#F59E0B', progress: '#F59E0B'}; // amber theme
    case 'Ongoing':
      return {bg: '#E0F2FE', badge: '#0EA5E9', progress: '#0EA5E9'}; // blue theme
    case 'Completed':
      return {bg: '#DCFCE7', badge: '#22C55E', progress: '#22C55E'}; // green theme
    case 'On Hold':
      return {bg: '#FCE7F3', badge: '#EC4899', progress: '#EC4899'}; // pink theme
    default:
      return {bg: '#F3F4F6', badge: '#9CA3AF', progress: '#9CA3AF'}; // gray
  }
};
const limitHtmlText = (html, limit = 50, ellipsis = '...') => {
  if (!html) return '';

  // Convert to string
  const htmlStr = html.toString();

  // Strip HTML tags
  let text = htmlStr
    .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove style tags and content
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags and content
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();

  // Return if within limit
  if (text.length <= limit) {
    return text;
  }

  // Truncate
  return text.slice(0, limit - ellipsis.length).trim() + ellipsis;
};

const limitHtmlTextByWord = (html, limit = 50, ellipsis = '...') => {
  if (!html) return '';

  const htmlStr = html.toString();

  // Strip HTML tags (same as above)
  let text = htmlStr
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= limit) {
    return text;
  }

  // Find last space before limit
  const truncated = text.slice(0, limit - ellipsis.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace === -1 || lastSpace < limit * 0.5) {
    return truncated.trim() + ellipsis;
  }

  return truncated.slice(0, lastSpace).trim() + ellipsis;
};

const FileIcon = ({fileType}) => {
  let icon;
  let color;
  switch (fileType?.toLowerCase()) {
    case 'pdf':
      icon = 'file-pdf-o';
      color = '#FF0000';
      break;
    case 'word':
      icon = 'file-word-o';
      color = '#0000FF';
      break;
    case 'image':
      icon = 'image';
      color = '#00FF00';
      break;
    default:
      icon = 'file-o';
      color = '#000000';
  }

  return <FontAwesome name={icon} size={20} color={color} />;
};

const Status_data = [
  'Pending',
  'Accepted',
  'Progress',
  'Completed',
  'Cancelled',
];

function safetyGear(list) {
  return list?.map(
    item =>
      item
        .split('_') // split by underscore
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize
        .join(' '), // join back with spaces
  );
}

function schedulesTransformal(data) {
  const tramsformed = (data || []).map(item => {
    return {
      id: item._id,
      title: item.title,
      time: item.startTime,
      endTime: item.endTime,
      metta: {status: item.status, project: item.project},
      startDate: item.startDate,
      endDate: item.endDate,
    };
  });
  return tramsformed;
}

const durationHrs = (start, end) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? `${Math.round(diff / 60)} hrs` : null;
};

const LIME = '#c6ef3e';
const LIME_DARK = '#8bc34a';
const DARK = '#1a1a1e';
const MUTED = '#9ca3af';
const BG = '#f5f5f5';

function getMarkedDates(schedules) {
  const dates = new Set();

  for (const booking of schedules) {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    const cursor = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
    const last = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
    );

    while (cursor <= last) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, '0');
      const d = String(cursor.getUTCDate()).padStart(2, '0');
      dates.add(`${y}-${m}-${d}`);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return Object.fromEntries(
    [...dates].map(date => [date, {marked: true, dotColor: LIME_DARK}]),
  );
}

function getNotifications(notification) {

  console.log('notification', notification);

  let screenParams = notification.screenParams;
  if (typeof screenParams === 'string') {
    try {
      screenParams = JSON.parse(screenParams);
    } catch (e) {
      screenParams = {};
    }
  }

  const scheduleId =
    screenParams.scheduleId ||
    notification.relatedTo?._id

  return {
    id: notification._id,
    siteName: notification.title || '',
    description: notification.body || '',
    action: false,
    screen: notification.screen || 'calendar',
    createdAt: new Date(notification.createdAt).getTime(),
    startDate: screenParams.startDate,
    endDate: screenParams.endDate,
    dateString: screenParams.startDate,
    status: screenParams.status || notification.status,
    scheduleStatus: screenParams?.scheduleStatus,
    startTime: screenParams.startTime,
    endTime: screenParams.endTime,
    scheduleId: scheduleId,
    completeAddress: screenParams.completeAddress,
    projectId: screenParams.projectId,
    projectName: screenParams.projectName,
    projectDescription: screenParams?.projectDescription,
    read : notification.status.read || false,
  };
}

function transformToProjectGeofence(jsonData) {
  return {
    projectId: jsonData.projectId,
    integratorId: jsonData.integratorId,
    id: jsonData.id || jsonData.scheduleId,
    siteName: jsonData.siteName,
    latitude: jsonData.latitude,
    longitude: jsonData.longitude,
    radius: jsonData.radius,

    // Active time window
    startDate: jsonData.startDate,
    endDate: jsonData.endDate,
    startTime: jsonData.startTime,
    endTime: jsonData.endTime,

    activeDays: jsonData.activeDays || [5], // Default to Friday if not provided

    userId: jsonData.userId || 'system', // You'll need to provide this
    firstName: jsonData.firstName || 'System',
    lastName: jsonData.lastName || 'User',

    completeAddress: jsonData.completeAddress,
    status: jsonData.status || 'Pending',

    // Optional fields
    priority: jsonData.priority,
    description: jsonData.description || jsonData.projectDescription,
    action: jsonData.action || false,
  };
}

export {
  getNotifications,
  getMarkedDates,
  durationHrs,
  Status_data,
  schedulesTransformal,
  safetyGear,
  FileIcon,
  limitHtmlTextByWord,
  limitHtmlText,
  getPriorityColor,
  getStatusTheme,
  truncate,
  capitalizeFirstLetter,
  formatMessageTimestamp,
  getRelativeTimeString,
  isSameDay,
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
  personalDocumentsArray,
  statusOptions,
  jobPhotoCategories,
  toModel,
  formatShortDate,
  formatShortDateYYYMMD,
  formatOnlyDate,
  transformToProjectGeofence
};
