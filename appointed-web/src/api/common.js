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
