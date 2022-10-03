import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import 'reflect-metadata'
import chalk from 'chalk'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import fs from 'fs'
import path from 'path'
import moment from 'moment'
import createDatabaseConnection from './database/connection'
import routes from './routes'
import './controllers/hos-monitor/childProcess'

import Utils from './utils'

dotenv.config()

const initializeExpress = (): void => {
  const app: Express = express()

  // cors
  app.use(cors())
  // set various HTTP headers
  app.use(helmet())
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))
  // parse application/json
  app.use(bodyParser.json())
  app.use(express.static('static'))
  // output log
  try {
    const errorLogStream = fs.createWriteStream(
      path.join(
        __dirname,
        `./logs/errorLogs/${moment().format('YYYYMMDD')}.log`
      ),
      { flags: 'a' }
    )
    const allLogStream = fs.createWriteStream(
      path.join(__dirname, `./logs/allLogs/${moment().format('YYYYMMDD')}.log`),
      { flags: 'a' }
    )
    app.use(morgan('combined', { stream: allLogStream }))
    app.use(
      morgan('combined', {
        skip: function (req, res) {
          return res.statusCode < 400
        },
        stream: errorLogStream
      })
    )
  } catch (error) {
    throw new Error(error as string)
  }

  // use routes
  app.use(routes)

  const port = process.env.PORT
  app.listen(port, () => {
    console.log(
      chalk.green(`⚡️[server]: Server is running at http://localhost:${port}`)
    )
  })
}

const establishDatabaseConnection = async (): Promise<void> => {
  try {
    await createDatabaseConnection()
    console.log('连接sql成功...')
  } catch (err) {
    throw new Error(err as string)
  }
}

const initializeApp = async (): Promise<void> => {
  // TODO: 连接数据库
  try {
    await establishDatabaseConnection()
  } catch (err) {
    throw new Error(err as string)
  }
  initializeExpress()
  // await Utils.sendEmail({
  //   to: '2838967868@qq.com',
  //   subject: '114监控平台',
  //   text: '服务正常启动'
  // })
}

initializeApp().catch((err) => {
  throw new Error(err as string)
})
