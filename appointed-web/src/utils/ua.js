import UAParser from "ua-parser-js";
export const isWeChat = () => {
  const ua = new UAParser().getResult();
  return ua.browser.name === 'WeChat'
}