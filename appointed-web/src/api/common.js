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
