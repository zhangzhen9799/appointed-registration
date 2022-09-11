### 114 网上预约挂号平台 监控平台

#### 114 官网查询接口 162 表示 hosCode

1. 首页的所有医院列表接口 分页查询

   https://www.114yygh.com/web/hospital/list?_time=1662730587759&keywords=&levelId=0&areaId=0&pageNo=1&pageSize=20

   Method: GET
   鉴权: Cookie
   接口所在页面: https://www.114yygh.com/

   | 参数     | 类型   | 默认值     | 含义                               |
   | -------- | ------ | ---------- | ---------------------------------- |
   | \_time   | number | Date.now() | 时间戳                             |
   | keywords | string | ---        | 关键词(可能与搜索也是同一个关键词) |
   | levelId  | number | ---        | 级别                               |
   | areaId   | number | ---        | 区域                               |
   | pageNo   | number | 1          | 分页属性                           |
   | pageSize | number | 20         | 分页属性                           |

2. 医院详情页 门诊列表

   https://www.114yygh.com/web/department/hos/list?_time=1662729484556&hosCode=162

   Method: GET
   鉴权: Cookie
   接口所在页面: https://www.114yygh.com/hospital/162/home

   | 参数    | 类型   | 默认值     | 含义                          |
   | ------- | ------ | ---------- | ----------------------------- |
   | \_time  | number | Date.now() | 时间戳                        |
   | hosCode | number | ---        | 医院 code (接口 1 中返回值中) |

3. 门诊挂号详情 通过上一步响应的内容 科室号 code 门诊 code 医院 code

   https://www.114yygh.com/web/product/list?_time=1662733088777

   Method: POST
   鉴权: Cookie
   接口所在页面: https://www.114yygh.com/hospital/162/d4a80dff4262f5815eee0362515986cf/200052524/source

   | 参数           | 类型   | 默认值    | 含义                                                                                           |
   | -------------- | ------ | --------- | ---------------------------------------------------------------------------------------------- |
   | firstDeptCode  | number | 科室 code | 时间戳                                                                                         |
   | secondDeptCode | number | ---       | 门诊 code (接口 2 中返回值中)                                                                  |
   | hosCode        | number | ---       | 医院 code (接口 1 中返回值中)                                                                  |
   | week           | number | 1         | 1 表示当前日期次日开始，7 天，然后返回的是 7 天的数据 2 表示当前日期开始第九天到第十五天的数据 |

   返回值中当天状态 status 值为 'AVAILABLE' 表示有号

#### 注意事项

1. 用浏览器插件不断刷新 114 平台，发现可能有对 ip 封禁（每天同个 ip 访问数量限制）的可能，这块建议看看能不能实现在云服务器上进行动态切换 ip
2. 目前暂未发现连续刷接口会对账号造成影响，（可以考虑收费，使用虚假账号完成订阅）

#### 鉴权方式

`headers: { Cookies: 'imed_session=atpXyENDKaSaxYo6ZAZvpSFswetcyDJl_5542437; imed_session=hIPDRiKlXtnBISc6Mxy5CXiahqOB2kTW_5542429; secure-key=e5e16e22-236d-478e-bdb5-aef48d5dee5d; imed_session=bsMFCIMQGYXZaUlC53MrWutjFWPMhLSi_5542915; cmi-user-ticket=d0p7EbDA5pFHrPZiLi2NpExOn1ZHnOL5cfrl3Q..; agent_login_img_code=ff5e0edf577e4d84b2e809c84f968641; imed_session_tm=1662874694023', Host: 'www.114yygh.com', 'Content-Type': 'application/json;charset=UTF-8', // 'Cache-Control': 'no-cache', Referer: 'https://www.114yygh.com/', Accept: 'application/json, text/plain, */*', 'Request-Source': 'PC', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36', 'Accept-Encoding': 'gzip, deflate, br', 'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"', 'sec-ch-ua-mobile': '?0', 'sec-ch-ua-platform': 'macOS', 'Sec-Fetch-Dest': 'empty', 'Sec-Fetch-Mode': 'cors', 'Sec-Fetch-Site': 'same-origin' }`
