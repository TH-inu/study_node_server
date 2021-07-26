var mysql = require('mysql');

// mysql 연결
var conn = mysql.createConnection({
    host : '3.36.243.240',
    user : 'test',
    password : 'test',
    database : 'test'
});
conn.connect();

var updateTime = 5*60; // 데이터 생성 주기 (sec)

setInterval(timerCallback, updateTime * 1000);

// 타이머 콜백 함수
function timerCallback() {
    var data = createData();
    console.log(data);

    var sql = 'INSERT into test(start_date, end_date, people, vehicle) value (?, ?, ?, ?)';
    conn.query(sql, [data.startDate, data.endDate, data.peopleNum, data.vehicleNum], (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('complete instert data');
        }
    });
}

// 샘플 데이터 랜덤으로 생성
function createData() {
    var peopleNum = Math.floor(Math.random() * 10);
    var vehicleNum = Math.floor(Math.random() * 5);
    console.log(peopleNum, vehicleNum);

    var currentDate = new Date();
    var endDate = new Date(currentDate);
    var startDate = new Date(currentDate.setSeconds(currentDate.getSeconds() - updateTime));
    console.log(startDate, endDate);

    return {
        peopleNum: peopleNum,
        vehicleNum: vehicleNum,
        startDate: startDate,
        endDate: endDate
    };
}