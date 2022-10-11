import { get, post } from './axios/http.js';

// 114预约监控登录
export const loginAPI = (params) => {
  return post('/v1/login', params);
};

export const getHosListAPI = (params) => {
  return get(
    `/114/get-hos-list?name=${params.name}&levelText=${params.levelText}&pageSize=${params.pageSize}&pageNo=${params.pageNo}`
  );
};

export const getDepListByHoscodeAPI = (params) => {
  return get(`/114/get-depart-list?hoscode=${params.hoscode}`);
};

// 提交预约

export const postAppointmentRecordAPI = (params) => {
  return post('/114/add-appointment-record', params);
};

// 查询预约列表
export const getAppointmentListAPI = (params) => {
  return get('/114/get-appointment-list');
};

// 发送114平台登录验证码
export const send114smsCodeAPI = (params) => {
  return post('/114/user-phone-send-msg', params);
};

// 登录114平台
export const login114ByPhoneAPI = (params) => {
  return post('/114/user-phone-login', params);
};

// 获取就诊人信息
export const getPatientInfoAPI = (params) => {
  return post('/114/user-get-patient-info', params);
};