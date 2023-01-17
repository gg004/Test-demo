export function classNames ( ...classes ) {
  return classes.filter( Boolean ).join( " " );
}

export const getNonNullValue = ( value ) => {
  if ( value != "" ) {
    return value;
  } else {
    return undefined;
  }
};

export function filterEmptyFields ( object ) {
  Object.keys( object ).forEach( ( key ) => {
    if ( empty( object[ key ] ) ) {
      delete object[ key ];
    }
  } );
  return object;
}

export function empty ( value ) {
  return value === "" || value === null || value === undefined || value === "undefined";
}

export const isImage = ( file ) => {
  const validImageTypes = [ "image/gif", "image/jpeg", "image/jpg", "image/png" ];
  if ( validImageTypes.includes( file.file.type ) ) return true;
  return false;
};

export const Steps = {
  CompanyInfo: "ComapanyInfo",
  CardDetails: "CardDetails",
}
const user7Data = {
  src: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-3-2@1x.png",
};

const usernameData = {
  usernameAdminname: "Username      AdminName",
  jamesGmailCom: "James@gmail.com",
  user7Props: user7Data,
};

const group2Data = {
  password: "Password",
  lock1: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/lock--1-@1x.png",
};
export const MobileLoginData = {
  pic5: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/pic-5-1@1x.png",
  pic2: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/pic-2-1@1x.png",
  pic4: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/pic-1@1x.png",
  pic1: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/pic-1-1@1x.png",
  appleTouchIcon: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/apple-touch-icon-1@1x.png",
  spanText1: "9:4",
  spanText2: "1",
  cellularConnection: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/cellular-connection-1@1x.png",
  wifi: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/wifi-1@1x.png",
  pic3: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/pic-2@1x.png",
  welcomeToVaypoynt: "Welcome to Vaypoynt",
  pleaseLoginYourAccount: "Please login your Account",
  forgotPassword: "Forgot Password?",
  line44: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/line-44@1x.png",
  logIn: "Log in",
  path1: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-1-1@1x.png",
  path2: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-2-1@1x.png",
  line2: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/line-1@1x.png",
  orLoginWith: "Or login with",
  line1: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/line-1@1x.png",
  iconAwesomeLinkedinIn: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/icon-awesome-linkedin-in@1x.png",
  donTHaveAnAccount: "Don't have an Account?",
  signUp: "Sign up",
  usernameProps: usernameData,
  group2Props: group2Data,
};


export const group5421Data = {
  children: "At The Office",
};

export const group5422Data = {
  children: "Vacation",
  className: "group-54-2",
};

export const group5431Data = {
  children: "Sick Day",
};

export const group5432Data = {
  children: "Meeting",
  className: "group-5",
};

export const homePageData = {
  bannonMorrissyRxiav5LcWwUnsplash: "/img/bannon-morrissy-rxiav5lc-ww-unsplash-2@1x.png",
  path25: "/img/path-24-1@1x.png",
  path24: "/img/path-24-1@1x.png",
  path26: "/img/path-24-1@1x.png",
  iconAwesomeCheck: "/img/icon-awesome-check-1@1x.png",
  path18: "/img/path-18-1@1x.png",
  group5421Props: group5421Data,
  group5422Props: group5422Data,
  group5431Props: group5431Data,
  group5432Props: group5432Data,
};
export const group542Data = {
  children: "Pick Floor",
};

export const group543Data = {
  children: "Desk Number",
};
export const AppStatusType = {
  Setup: "Setup",
  Connected: "Connected",
  Pending: "Pending",
};

export const AppStatusColorType = {
  Setup: "#cbd5e1",
  Connected: "#8ef58a",
};

export const deskHotellingData = {
  xnew: "New",
  line39: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/line-39-1@1x.png",
  preset: "Preset",
  duration: "Duration",
  hour: "Hour",
  minutes: "Minutes",
  submitBooking: "Submit Booking",
  path18: "https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-18-1@1x.png",
  saveAsPreset: "Save as Preset",
  group542Props: group542Data,
  group543Props: group543Data,
};

export const assignCmsData = ( cmsData ) => {
  const data = {
    bannerTitle: '',
    bannerParah: '',
    bannerTagLine: '',
    aboutParah1: '',
    aboutParah2: '',
    hiwParah: '',
    wifParah: '',
    integrationParah: '',
    integrationInfo: '',
    platformSolution: '',
    price: '',
    directoryOrganization: '',
    downloadTitle: '',
    downloadParah: '',
    contactPhone: '',
    contactEmail: '',
  }
  for ( let i = 0; i < cmsData.length; i++ ) {
    switch ( cmsData[ i ].content_key ) {
      case "banner-title":
        data.bannerTitle = cmsData[ i ].content_value
        break;
      case "banner-parah":
        data.bannerParah = cmsData[ i ].content_value
        break;
      case "banner-tag-line":
        data.bannerTagLine = cmsData[ i ].content_value
        break;
      case "about-parah1":
        data.aboutParah1 = cmsData[ i ].content_value
        break;
      case "about-parah2":
        data.aboutParah2 = cmsData[ i ].content_value
        break;
      case "how-it-works-parah":
        data.hiwParah = cmsData[ i ].content_value
        break;
      case "wfh-parah":
        data.wifParah = cmsData[ i ].content_value
        break;
      case "integration-parah":
        data.integrationParah = cmsData[ i ].content_value
        break;
      case "integration-info":
        data.integrationInfo = cmsData[ i ].content_value
        break;
      case "platform-solution":
        data.platformSolution = cmsData[ i ].content_value
        break;
      case "price":
        data.price = cmsData[ i ].content_value
        break;
      case "directory-organization":
        data.directoryOrganization = cmsData[ i ].content_value
        break;
      case "download-title":
        data.downloadTitle = cmsData[ i ].content_value
        break;
      case "download-parah":
        data.downloadParah = cmsData[ i ].content_value
        break;
      case "Contact-phone":
        data.contactPhone = cmsData[ i ].content_value
        break;
      case "Contact-Email":
        data.contactEmail = cmsData[ i ].content_value
        break;
    }
  }
  return data
}

export const statusTypes = [
  { map: 0, status: "office" },
  { map: 1, status: "wfh" },
  { map: 2, status: "vacation" },
  { map: 3, status: "holiday" },
  { map: 4, status: "sick day" },
  { map: 5, status: "meeting" },
]
export const departmentColors = [
  "#ffffff",
  "#77dffc",
  "#ffd962",
  "#ff9696",
  "#8ef58a",
  "#f4b9ff",
  "#ffd9a5",
  "#b4f8db",
  "#f1f7a6",
]

export const AppType = {
  Teams: "Teams",
  Slack: "Slack",
  Outlook: "Outlook",
}