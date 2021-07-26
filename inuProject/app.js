const mysql = require('mysql');
const express = require('express');
const ejs = require('ejs');
const schedule = require('node-schedule');

// mysql 연결
var conn = mysql.createConnection({
    host : '3.36.243.240',
    user : 'test',
    password : 'test',
    database : 'test',
    dateStrings : 'data'
});
conn.connect();

// express 사용
const app = express();
app.set('view engine', 'ejs');
app.use(express.json());

var port = 8080;
app.listen(port, () => {
    console.log(`start app listening at http://localhost:${port}`)
});

app.get('/', (req, res) => {
    res.redirect('/mainPage');
})

app.get('/mainPage', (req, res) => {
    var sql = 'select min(start_date), max(end_date) from test';
    conn.query(sql, (err, row) => {
        if (err) {
            console.log(err);
        } else {
            console.log(row);
            res.render('./mainPage.ejs', { data: row[0] }); // min(start_date), max(end_date)
        }
    });
});

app.post('/mainPage/refreshData', (req, res) => {
    console.log(req.body);
    var sql = 'select * from test order by id desc limit 1'
    conn.query(sql, (err, row) => {
        if (err) {
            console.log(err);
        } else {
            console.log(row);
            res.json(row[0]); // latest row
        }
    });
});

app.post('/mainPage/dateSelect', (req, res) => {
    var data = req.body;
    var sql = 'select sum(people), sum(vehicle) from test where start_date >= ? and end_date <= ?'
    conn.query(sql, [data.startDate, data.endDate], (err, row) => {
        if (err) {
            console.log(err);
        } else {
            console.log(row);
            res.json(row[0]); // sum(people), sum(vehicle)
        }
    });
});


// Create Sample Data
app.get('/createSampleData', (req, res) => {
    res.render('./createDataPage.ejs');
});

app.post('/createSampleData', (req, res) => {
    console.log(req.body);
    var data = req.body;

    var startTime = new Date(data.startDate).setHours(data.startTime);
    var endTime = new Date(data.endDate).setHours(data.endDate);

    var flag = 1;
    var job = schedule.scheduleJob({
        start: startTime,
        end: endTime+1,
        rule: '*/5 * * * *' // 주기 (5분마다)
    },
    function() {
        if (flag == 1) {
            res.json('Scheduler is Working');
            flag = flag + 1;
        }

        var data = createData(5*60);
        var sql = 'INSERT into test(start_date, end_date, people, vehicle) value (?, ?, ?, ?)';
        conn.query(sql, [data.startDate, data.endDate, data.peopleNum, data.vehicleNum], (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('complete instert data');
            }
        });
    });
})

// 샘플 데이터 랜덤으로 생성
function createData(updateTime) {
    var peopleNum = Math.floor(Math.random() * 10);
    var vehicleNum = Math.floor(Math.random() * 5);
    console.log(peopleNum, vehicleNum);

    var currentDate = new Date();
    var endDate = new Date(currentDate);
    var startDate = new Date(currentDate.setSeconds(currentDate.getSeconds() - updateTime));
    console.log(startDate.toString(), endDate.toString());

    return {
        peopleNum: peopleNum,
        vehicleNum: vehicleNum,
        startDate: startDate,
        endDate: endDate
    };
}