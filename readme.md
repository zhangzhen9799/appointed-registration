### 114平台 余号监控 + 代挂系统

#### 环境安装
  1. Node
  2. 其他的已经继承到项目依赖中，应该不需要安装

#### appointed-server 为后端项目
##### 开发项目 
  1. 创建mysql 数据库，并导入根目录auto-register.sql 数据
    * 数据库相关信息
    {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '12345678',
      database: 'test',
      synchronize: true,
      logging: false,
    }
    * 数据库配置路径 appointed-server/src/database/orm-data-source.ts
  2. 本地启动项目
    * 安装依赖 npm install
    * 启动 npm run start

#### appointed-web 为前端项目

##### 开发项目 
  1. 本地启动项目
    * 安装依赖 npm install
    * 启动 npm run dev
    * 浏览器打开 http://localhost:9000
    * 账号密码 
      auto-register@163.com
      admin
