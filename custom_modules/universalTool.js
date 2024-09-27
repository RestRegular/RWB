const TTool = require('./timeTool')

function getRandom(min, max){
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random()*(max - min + 1)) + min
}

/**
 * 
 * @param {String} account 
 * @param {String} password 
 * @param {Number} validity - 信证有效期，单位秒
 * @returns String - 信证字符串
 */
function encryptAccountInfo(account, password, validity){
    account = Buffer.from(account).toString('base64')
    password = Buffer.from(password).toString('base64')
    recordtime = Buffer.from(TTool.getFormatNowTime()+'|'+validity).toString('base64')
    const keys = []
    const key_num = (account+password+recordtime).length+3
    for (let i = 0; i < key_num; i++){
        keys.push(getRandom(0,9))
    }
    const encrypt_keys = []
    let key_info = ''
    for(let key of keys){
        const tem_key = String.fromCharCode(key/10*26+97)
        encrypt_keys.push(tem_key)
        key_info += tem_key
    }
    let index = 0;
    let encrypt_account_info = (
        String.fromCharCode(account.length+keys[index++]+65)+
        String.fromCharCode(password.length+keys[index++]+65)+
        String.fromCharCode(recordtime.length+keys[index++]+65)+
        String.fromCharCode(key_num+65)
    )
    for(const acc of account){
        let encrypt_acc = acc.charCodeAt(0) + keys[index]
        encrypt_account_info += String.fromCharCode(encrypt_acc)
        index++
    }
    for(const pas of password){
        let encrypt_pas = pas.charCodeAt(0) + keys[index]
        encrypt_account_info += String.fromCharCode(encrypt_pas)
        index++
    }
    for(const rct of recordtime){
        let encrypt_rct = rct.charCodeAt(0) + keys[index]
        encrypt_account_info += String.fromCharCode(encrypt_rct)
        index++
    }
    return Buffer.from(encrypt_account_info+key_info).toString('base64')
}

function decodeAccountInfo(encrypt_info){
    encrypt_info = Buffer.from(encrypt_info, 'base64').toString()
    const org_acc_length = encrypt_info.charCodeAt(0)-65
    const org_pas_length = encrypt_info.charCodeAt(1)-65
    const org_rct_lenght = encrypt_info.charCodeAt(2)-65
    const key_length = encrypt_info.charCodeAt(3)-65
    const org_keys = encrypt_info.substring(encrypt_info.length-key_length)
    const rel_keys = []
    for (const key of org_keys){
        rel_keys.push(Math.round((key.charCodeAt(0)-97)/26*10))
    }
    const acc_length = org_acc_length - rel_keys[0]
    const pas_length = org_pas_length - rel_keys[1]
    const rct_length = org_rct_lenght - rel_keys[2]
    const org_account = encrypt_info.substring(4, 4+acc_length)
    const org_password = encrypt_info.substring(4+acc_length, 4+acc_length+pas_length)
    const org_rct = encrypt_info.substring(4+acc_length+pas_length, 4+acc_length+pas_length+rct_length)
    let rel_account = ''
    let index = 3
    for(const char of org_account){
        rel_account += String.fromCharCode(char.charCodeAt(0) - rel_keys[index])
        index++
    }
    rel_account = Buffer.from(rel_account, 'base64').toString()
    let rel_password = ''
    for(const char of org_password){
        rel_password += String.fromCharCode(char.charCodeAt(0) - rel_keys[index])
        index++
    }
    rel_password = Buffer.from(rel_password, 'base64').toString()
    let rel_rct = ''
    for(const char of org_rct){
        rel_rct += String.fromCharCode(char.charCodeAt(0) - rel_keys[index])
        index++
    }
    rel_rct = Buffer.from(rel_rct, 'base64').toString()
    return {
        account: rel_account,
        password: rel_password,
        rct: rel_rct.split('|')[0],
        validity: parseInt(rel_rct.split('|')[1])
    }
}

module.exports = {
    'getRandom': getRandom,
    'encryptAccountInfo': encryptAccountInfo,
    'decodeAccountInfo': decodeAccountInfo
}

// for(let i = 0; i<100; i++){
//     const account_num = getRandom(10, 20)
//     const password_num = getRandom(10, 20)
//     let account = ''
//     for(let o = 0; o<account_num; o++){
//         account += String.fromCharCode(getRandom(48, 90))
//     }
//     let password = ''
//     for(let o = 0; o<password_num; o++){
//         password += String.fromCharCode(getRandom(48, 90))
//     }
//     console.log('-------------第'+(i+1)+'数据-------------')
//     console.log('account:', account, ', password:', password)
//     console.log('encrypt_info:', encryptAccountInfo(account, password))
// }

// console.log(encryptAccountInfo('明天中午要去吃饭吗？', '', 0))

// console.log(decodeAccountInfo('U1JmeFRzVX5NRWl6UlhEfVVwUkROXEvCgFdIXjdWcUTCgVRDNndXWDJ+VnBJwoBTS29+VmtyN1JefTpmeHhweHVrYWNwZm5raG51cHhzY3VmcHhreG54c2h1cGFwYXVuZm54c3V4cHNhbnVjaHBucHB4'))
                               //U1JmeFRzVX5NRWl6UlhEfVVwUkROXEvCgFdIXjdWcUTCgVRDNndXWDJ+VnBJwoBTS29+VmtyN1JefTpmeHhweHVrYWNwZm5raG51cHhzY3VmcHhreG54c2h1cGFwYXVuZm54c3V4cHNhbnVjaHBucHB4