import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const localIP = "192.168.1.2"; //Change
const emulatorIP = "10.0.2.2"; 

const getExpoDebuggerIP = () => {
  try {
    const expoConfig = Constants.expoConfig as any;
    const manifest = Constants.manifest as any;
    
    const expoGo = expoConfig?.extra?.expoGo?.debuggerHost || manifest?.debuggerHost;
    
    if (expoGo) {
      return expoGo.split(':').shift();
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};

const getBaseUrl = () => {
  let baseURL = 'http://localhost:5286';

  console.log('Platform:', Platform.OS);

  switch (Platform.OS) {
    case 'web':
      baseURL = 'http://localhost:5286';
      break;
      
    case 'android':
      const androidIP = getExpoDebuggerIP();
      if (androidIP) {
        baseURL = `http://${androidIP}:5286`;
      } else {
        baseURL = `http://${emulatorIP}:5286`;
      }
      break;
      
    case 'ios':
      const iosIP = getExpoDebuggerIP();
      if (iosIP) {
        baseURL = `http://${iosIP}:5286`;
      } else {
        baseURL = `http://${localIP}:5286`;
      }
      break;
      
    default:
      baseURL = 'http://localhost:5286';
      break;
  }

  console.log('Using baseURL:', baseURL);
  return baseURL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

//Request
api.interceptors.request.use(
  config => {
    //token
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error(error);
    return Promise.reject(error);
  }
);

//Response
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default api;