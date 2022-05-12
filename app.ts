import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import bodyParser from 'body-parser'
import LoggerMiddleware from './middleware/logger.middleware'
import expressJWT from 'express-jwt'
import config from './config/token'

import indexRouter from './routes/index'
import usersRouter from './routes/users'
import teamRouter from './routes/team'
import saleSlipRouter from './routes/saleSlip'

const app = express()

app.use(LoggerMiddleware)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json({limit: '50mb'}));//使能 post 50mb以下的数据
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(
  expressJWT({
    secret: config.tokenKey,
    algorithms: ['HS256'],
  }).unless({
    path: ['/users/login','/getAccessToken'], //⽩白名单,除了了这⾥里里写的地址，其他的URL都需要验证
  }),
)
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/team', teamRouter)
app.use('/saleSlips', saleSlipRouter)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  if (err.name === 'UnauthorizedError') {
    // 这个需要根据⾃自⼰己的业务逻辑来处理理
    res.status(200).send({ code: 401, msg: '信息失效了，请重新登录' })
  } else {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {} // render the error page

    res.status(err.status || 500)
    res.render('error')
  }
} as express.ErrorRequestHandler)

export default app
