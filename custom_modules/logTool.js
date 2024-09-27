const dateFormat = require('./timeTool')

function rlog(type, msg){
    console.log('(',type,') [', dateFormat.getFormatNowTime(), '] :', msg)
}

module.exports = {
    'rlog': rlog
}