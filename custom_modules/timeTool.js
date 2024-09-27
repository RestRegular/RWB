// 定义格式化时间的方法
function getFormatNowTime(){
    const dt = new Date();
    
    const y = dt.getFullYear();
    const m = padZero(dt.getMonth() + 1);
    const d = padZero(dt.getDate());

    const hh = padZero(dt.getHours());
    const mm = padZero(dt.getMinutes());
    const ss = padZero(dt.getSeconds());

    return y+'-'+m+'-'+d+' '+hh+':'+mm+':'+ss;
}

function padZero(n){
    return n>9 ? n : '0'+n;
}

function splitFormatDate(date){
    const y = parseInt(date.split('-')[0])
    const M= parseInt(date.split('-')[1])
    const d = parseInt(date.split('-')[2].split(' ')[0])
    const h = parseInt(date.split(' ')[1].split(':')[0])
    const m = parseInt(date.split(' ')[1].split(':')[1])
    const s = parseInt(date.split(' ')[1].split(':')[2])
    return {
        'y': y,
        'M': M,
        'd': d,
        'h': h,
        'm': m,
        's': s
    }
}

function calculateDateInterval(date1, date2){
    const date_info_1 = splitFormatDate(date1)
    const date_info_2 = splitFormatDate(date2)
    const interval = (date_info_2.s-date_info_1.s)+(date_info_2.m-date_info_1.m)*60+
    (date_info_2.h-date_info_1.h)*60*60+(date_info_2.d-date_info_1.d)*24*60*60
    return interval
}

module.exports = {
    'getFormatNowTime': getFormatNowTime,
    'calculateDateInterval': calculateDateInterval,
    'splitFormatDate': splitFormatDate
};

// console.log(calculateDateInterval('2024-09-21 23:13:01', getFormatNowTime()))