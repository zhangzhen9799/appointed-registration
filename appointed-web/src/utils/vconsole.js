import VConsole from 'vconsole';
// console.log('process.env.CUSTOM_ENV', process.env.CUSTOM_ENV);
(process.env.NODE_ENV === 'development' || process.env.CUSTOM_ENV === 'dev') &&
  new VConsole();
