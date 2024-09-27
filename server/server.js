const TTool = require('../custom_modules/timeTool')
const logTool = require('../custom_modules/logTool')
const UTool = require('../custom_modules/universalTool')
const fs = require('fs')
const path = require('path')
const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const statuse = require('statuses')
const e = require('express')

const VALIDITY = 5

function connectToMysql(username, password, database) {
    return mysql.createPool({
        host: '127.0.0.1',
        user: username,
        password: password,
        database: database
    })
}

function checkloginserver(tem_account, tem_password, callback) {
    if (tem_account === '') {
        return {
            state: false,
            cause: '账号为空'
        }
    }
    const account = tem_account
    const password = tem_password
    const sqlStr = 'SELECT statue, password FROM user WHERE (`account`=?)'
    let results = {}
    connection.query(sqlStr, account, (err, result) => {
        if (err != null) {
            results = console.log(err.message)
        }
        try {
            if (result[0].statue == 1) {
                if (password === result[0].password) {
                    results = {
                        state: true,
                        cause: ''
                    }
                } else {
                    results = {
                        state: false,
                        cause: '账号与密码不匹配'
                    }
                }
            } else {
                results = {
                    state: false,
                    cause: '账号信息不存在或已注销'
                }
            }
        } catch (error) {
            results = {
                state: false,
                cause: '账号信息不存在'
            }
        }
        callback(null, results)
    })
}

app = express()

app.use(cors())

const connection = connectToMysql('root', '197346285', 'rwb')

app.get('/test', (req, res) => {
    console.log('API test succeed')
})

app.get('/checklogin', (req, res) => {
    const account = req.query.account
    const password = req.query.password
    checkloginserver(account, password, (err, result) => {
        if (err) {
            return console.log(err.message)
        }
        if (result.state) {
            res.send({
                code: 0,
                data: {
                    code: 0,
                    msg: '登录成功！等待跳转...',
                    url: 'http://127.0.0.1:8080/index?info=' + UTool.encryptAccountInfo(account, password, VALIDITY),
                    cause: ''
                }
            })
        } else {
            res.send({
                code: -1,
                data: {},
                msg: '账号登录失败！',
                cause: result.cause
            })
        }
    })
})

app.get('/regist', (req, res) => {
    const account = req.query.account
    const password = req.query.password
    const sqlStr = 'SELECT statue FROM user WHERE (`account`=?)'
    connection.query(sqlStr, account, (err, result) => {
        if (err != null) {
            return console.log(err.message)
        }
        try {
            if (account == '' || result[0].statue == 1) {
                let cause = ''
                if (account == '') {
                    cause = '账号为空'
                } else {
                    cause = '账号重复注册'
                }
                res.send({
                    code: -1,
                    data: {},
                    msg: '注册账户失败！',
                    cause: cause
                })
            } else {
                throw new Error('new error')
            }
        } catch (error) {
            const sqlStr1 = 'INSERT INTO user (account, password) VALUES (?, ?)'
            connection.query(sqlStr1, [account, password], (err, result) => {
                if (err != null) {
                    return console.log(err)
                }
                res.send({
                    code: 0,
                    data: {
                        account: account,
                        password: password
                    },
                    msg: '账号注册成功！',
                    cause: ''
                })
            })
        }
    })
})

app.get('/login', (req, res) => {
    const filepath = path.join(__dirname, '../', '/web', '/login.html')
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error(err.message)
            res.status(500).send('Internal Server Error')
        } else {
            res.send(data)
        }
    })
})

app.get('/getresource', (req, res) => {
    const type = req.query.type
    const object = req.query.object
    logTool.rlog('log', 'request resource about -> ' + type + ' > ' + object)
    try {
        if (type == 'photo') {
            const filepath = path.join(__dirname, '../', '/resources', '/photo', '/' + object + '.png')
            res.sendFile(filepath)
        }
    } catch (err) {
        console.log(err.message)
    }
})

app.get('/getorders', (req, res) => {
    const sqlStr = 'SELECT * FROM `order` WHERE `index`>=? AND `state`=0'
    connection.query(sqlStr, Number(req.query.index), (err, results) => {
        if (err) {
            return console.log(err.message)
        }
        fs.readFile(
            path.join(__dirname, '../', '/resources', '/text', '/orderhtml.txt'),
            'utf8',
            (err, data) => {
                if (err) {
                    return console.log(err.message)
                }
                res.send({
                    code: 0,
                    data: results,
                    htmltext: data,
                    msg: '获取成功！'
                })
            }
        )
    })
})

app.get('/index', (req, res) => {
    if ('info' in req.query) {
        const info = UTool.decodeAccountInfo(req.query.info.replace(/ /g, '+'))
        checkloginserver(info.account, info.password, (err, result) => {
            if (result.state) {
                const nowtime = TTool.getFormatNowTime()
                if(TTool.calculateDateInterval(info.rct, nowtime) <= info.validity){
                    fs.readFile(
                        path.join(__dirname, '../', '/web', '/index.html'),
                        'utf8',
                        (err, data) => {
                            if (err) {
                                return console.log(err.message)
                            }
                            res.send(data)
                        }
                    )
                }else{
                    res.send('<h1 style="width: 100%;text-align: center;color: red;">此信证已过期，请重新登录！准备跳转中...</h1><a href="javascript:location.replace(\'http://127.0.0.1:8080/login\')">点击我跳转到登录界面</a>')
                }
            } else {
                res.send('<h1 style="width: 100%;text-align: center;color: red;">404 Not Found 2</h1>')
            }
        })
    }else{
        res.send('<h1 style="width: 100%;text-align: center;color: red;">404 Not Found 1</h1>')
    }
})

app.listen(8080, () => {
    console.log('[ http://127.0.0.1:8080/test ]')
})