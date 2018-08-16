const request = require('request'); // to request http

const { crawler } = require('./util.js');

exports.getCalendar = (year, month, callback) => {
    month = "0" + month; month = month.slice(-2);
    let calendarURL = "https://www.skku.edu/app/board/calendar/getMonthData.do?boardNo=23";
    calendarURL += "&date="+year+"-"+month+"-01";

    let calendar = [];
    request(
        {
            url: calendarURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(calendar);
            }
            else if (response.statusCode !== 200) {
                callback(calendar);
            }
            else {
                const resultJSON = JSON.parse(body);
                if (resultJSON.success) {
                    resultJSON.data.forEach(calElement => {
                        calendar.push({
                            title: calElement.title,
                            startDate: calElement.etcDate1,
                            endDate: calElement.etcDate2
                        })
                    });
                }
                callback(calendar);
            }
        }
    );
}

exports.getDomCalendar = (campusType, year, month, callback) => {
    month = "0" + month; month = month.slice(-2);
    let boardNo = 92;
    if (campusType === 1) {
        boardNo = 63;
    }
    let calendarURL = "https://dorm.skku.edu/_custom/skku/_common/board/miniboard/calendarDetailList.jsp?";
    calendarURL += "searchDate=+"+year+month+"&board_no="+boardNo+"&calendarType=MONTH&locale=ko"

    let calendar = [];
    request(
        {
            url: calendarURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
        }, (error, response, body) => {
            if (error) {
                callback(calendar);
            }
            else if (response.statusCode !== 200) {
                callback(calendar);
            }
            else {
                const resultJSON = JSON.parse(body);
                resultJSON.list.forEach(calElement => {
                    calendar.push({
                        title: calElement.article_title,
                        startDate: calElement.etc_char1,
                        endDate: calElement.etc_char2
                    })
                });
                callback(calendar);
            }
        }
    );
}

exports.getTodayCalendar = (callback) => {
    const today = new Date();
    const year = today.getFullYear();
    let month = (today.getMonth() + 1)
    month = "0" + month; month = month.slice(-2);
    let day = today.getDate();
    day = "0" + day; day = day.slice(-2);

    let todayCalendarURL = "https://www.skku.edu/app/board/calendar/getCalendarData.do?boardNo=23"
    todayCalendarURL += "&date="+year+"-"+month+"-"+day;

    let todayStr = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();

    let todayCalendar = {
        today: todayStr,
        list: []
    }
    request(
        {
            url: todayCalendarURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
        }, (error, response, body) => {
            if (error) {
                callback(todayCalendar);
            }
            else if (response.statusCode !== 200) {
                callback(todayCalendar);
            }
            else {
                const resultJSON = JSON.parse(body);
                if (resultJSON.success) {
                    resultJSON.data.forEach(calElement => {
                        todayCalendar.list.push({
                            title: calElement.title,
                            startDate: calElement.etcDate1,
                            endDate: calElement.etcDate2
                        })
                    });
                }
                callback(todayCalendar);
            }
        }
    );
}