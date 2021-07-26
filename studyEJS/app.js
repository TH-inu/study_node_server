var express = require('express');
var ejs = require('ejs');
var path = require('path');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
// const { min } = require('d3');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// mysql 선언
var conn = mysql.createConnection({
    host : '3.36.243.240',
    user : 'test',
    password : 'test',
    database : 'test'
});
conn.connect();

app.get('/', (req, res) => {
    res.redirect('/login');
});

// 로그인 정보 가져오기
app.get('/login', (req, res) => {
    res.render(path.join(__dirname, '/views/login.ejs'));
});
var group;
var patient;
app.post('/login', (req, res) => {
    console.log(req.body);
    group = req.body.groupID;
    patient = req.body.patientID;
    conn.query("select EXISTS (select * from measuretemp_202102 where group_id = '"+group+"' and patient_id = '"+patient+"') as success", (err, rows, fields) => {
        if (err) {
            console.log(err);
        } else {
            if (rows[0].success === 1) {
                res.redirect('/option');
            } else {
                res.write('<script>alert("Wrong ID. Please check the ID"); history.back();</script>');
            }
        }
    });
});

// 날짜 범위 설정
app.get('/option', (req, res) => {
    conn.query('select min(reg_date), max(reg_date) from measuretemp_202102', (err, rows, fields) => {
        if (err) {
            console.log(err);
        } else {
            var date = [];
            var d = new Date(rows[0]["min(reg_date)"]);
            date.push([d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()]);
            d = new Date(rows[0]["max(reg_date)"]);
            date.push([d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()]);
            res.render(path.join(__dirname, '/views/option.ejs'), 
                                {minDate : date[0], maxDate : date[1]});
        }
    });
});
var firstDate;
var lastDate;
app.post('/option', (req, res) => {
    console.log(req.body);
    var val = req.body;
    firstDate = [[val.firstYear, val.firstMonth, val.firstDay].join('-'), [val.firstHour, val.firstMinute, val.firstSecond].join(':')].join(' ');
    lastDate = [[val.lastYear, val.lastMonth, val.lastDay].join('-'), [val.lastHour, val.lastMinute, val.lastSecond].join(':')].join(' ');

    res.redirect('/showGraph');
});


app.get('/showGraph', (req, res) => {
    // 데이터 받아오기
    conn.query("select temp, reg_date from measuretemp_202102 where group_id = '"+group+"' and patient_id = '"+patient+"' and reg_date >= '"+firstDate+"' and reg_date <= '"+lastDate+"'", function(err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            var xlabels = [];
            var ylabels = [];
            for (var i = 0; i < rows.length; i++) {
                groupList = [];
                patientList = [];

                var str = rows[i].reg_date;
                var d = new Date(str);
                yddList = [d.getUTCFullYear().toString(), 
                        (d.getUTCMonth()+1).toString(), 
                        d.getUTCDate().toString()];
                ydd = yddList.join('-');
                hmsList = [d.getUTCHours().toString(), 
                        d.getUTCMinutes().toString(), 
                        d.getUTCSeconds().toString()];
                hms = hmsList.join(':');
                xlabelsList = [ydd, hms];
                xlabels.push(xlabelsList.join(' '));
                ylabels.push(Number(rows[i].temp));
            }
            res.render(path.join(__dirname, '/views/view.ejs'), {xlabels: xlabels, 
                                                                 ylabels: ylabels});
        }
    });
});

app.listen(8080, () => {
    console.log('server is listening');
});