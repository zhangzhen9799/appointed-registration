import instance from "@/api/axios/request";


import qs from 'qs'

//get请求
export function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        instance
            .get(url, {
                params: params,
            })
            .then((response) => {
                resolve(response);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

//post请求
export function post(url, data = {}) {
    return new Promise((resolve, reject) => {
        instance.post(url, data).then(
            (response) => {
                resolve(response);
            },
            (err) => {
                reject(err);
            }
        );
    });
}


//post form请求
export function postForm(url, postData = {}) {
    return new Promise((resolve, reject) => {
        instance.request({
            url: url,
            method: 'post',
            data: qs.stringify(postData),
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
        }).then(
            (response) => {
                resolve(response);
            },
            (err) => {
                reject(err);
            }
        );
    });
}
