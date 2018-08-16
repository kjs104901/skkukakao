const request = require('request'); // to request http

const { crawler, getConfig, xmlParser } = require('./util.js');

const Stationsline1Up = ["성균관대", "", "화서", "", "수원", "", "세류", "", "병점", "", "서동탄/세마", "", "오산대", "", "오산", "", "진위", "", "송탄"];
const Stationsline1Down = ["성균관대", "", "의왕", "", "당정", "", "군포", "", "금정", "", "명학", "", "안양", "", "관악", "", "석수", "", "금청구청"];
const Stationsline4Up = ["혜화", "", "동대문", "", "동대문역사문화공원", "", "충무로", "", "명동", "", "회현", "", "서울", "", "숙대입구", "", "삼각지", "", "신용산"];
const Stationsline4Down = ["혜화", "", "한성대입구", "", "성신여대입구", "", "길음", "", "미아사거리", "", "미아", "", "수유", "", "쌍문", "", "창동", "", "노원"];

//// https://smss.seoulmetro.co.kr/traininfo/traininfoUserView.do ////
exports.getSubway = (campusType, direction, callback) => {
    let subwayURL = "https://smss.seoulmetro.co.kr/traininfo/traininfoUserMap.do";
    let lineCode = 0;
    let referenceArray = [];
    let trainArray = [];
    let resultNumber = 0;

    let isError = false;
    if (campusType === 0) {
        lineCode = 4;
        if (direction === 0) {
            referenceArray = Stationsline4Up.slice();
        }
        else if (direction === 1) {
            referenceArray = Stationsline4Down.slice();
        }
        else {
            isError = true;
        }
    }
    else if (campusType === 1) {
        lineCode = 1;
        if (direction === 0) {
            referenceArray = Stationsline1Up.slice();
        }
        else if (direction === 1) {
            referenceArray = Stationsline1Down.slice();
        }
        else {
            isError = true;
        }
    }
    else {
        isError = true;
    }

    if (isError) {
        callback({
            resultNumber: resultNumber,
            referenceArray: referenceArray,
            trainArray: trainArray
        });
        return;
    }

    trainArray.length = referenceArray.length;
    for (let index = 0; index < trainArray.length; index++) {
        trainArray[index] = [];
    }

    let subwayForm = {
        line: `${lineCode}`,
        isCb: "N"
    }
    request(
        {
            url: subwayURL,
            headers: crawler.getNormalHeader(),
            method: "POST",
            form: subwayForm
        }, (error, response, body) => {
            if (!error) {
                if (response.statusCode === 200) {
                    crawler.setTargetStr(body);

                    const lineStartStr = `<div class="${lineCode}line_metro">`;
                    const lineEndStr = `<div class="${lineCode + 1}line">`;
                    let lineStr = crawler.getBetweenMoveTarget(lineStartStr, lineEndStr);

                    crawler.setTargetStr(lineStr);
                    while (-1 < crawler.getTargetStr().indexOf("<div class=\"T")) {
                        crawler.moveTargetAfter("<div class=\"T");
                        const destination = crawler.getBetweenMoveTarget("_", " tip").split("_");
                        const number = crawler.getBetweenMoveTarget("title=\"", "열");
                        const state = crawler.getBetweenMoveTarget("차  ", "\"").split(" ");

                        const expressStr = crawler.getBetweenMoveTarget("data-statnTcd=\"", "\"");
                        let isExpress = false;
                        if (-1 < expressStr.indexOf("_E")) {
                            isExpress = true;
                        }

                        directionCheck = false;
                        if ((destination[0] === "N" || destination[0] === "Y") && lineCode === 4) {
                            if (destination[1] === (direction + 1).toString()) {
                                directionCheck = true;
                            }
                        }
                        if ((destination[0] === "0" || destination[0] === "1") && lineCode === 1) {
                            if (destination[1] === (direction).toString()) {
                                directionCheck = true;
                            }
                        }

                        const gotTrain = {
                            number: number * 1,
                            station: state[0],
                            doing: state[1],
                            destination: state[2],
                            isExpress: isExpress
                        };

                        if (directionCheck) {
                            referenceArray.forEach((item, index) => {
                                if (item === gotTrain.station) {
                                    let trainIndex = -1
                                    if (gotTrain.doing === "진입" || gotTrain.doing === "이동") {
                                        trainIndex = index + 1;
                                    }
                                    else if (gotTrain.doing === "도착") {
                                        trainIndex = index;
                                    }
                                    else if (gotTrain.doing === "출발") {
                                        trainIndex = index - 1;
                                    }

                                    if (-1 < trainIndex) {
                                        if (trainArray[trainIndex]) {
                                            trainArray[trainIndex].push(gotTrain);
                                            resultNumber += 1;
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            }
            callback({
                resultNumber: resultNumber,
                referenceArray: referenceArray,
                trainArray: trainArray
            });
        }
    )
}

//// https://www.data.go.kr/ ////
//// 버스도착정보 조회 서비스 (기관: 경기도) ////
exports.getBus = (busType, callback) => {
    const APIKey = getConfig("busAPIKey");
    const APIURL = "http://openapi.gbis.go.kr/ws/rest/busarrivalservice";

    let busInfo = {
        stationId: "",
        stationNumber: "",
        stationName: "",
        destinationName: "",
        routeId: "",
        routeName: "",

        resultNumber: 0,
        resultArray: [
            {
                location: -1,
                predictTime: -1,
                remainSeats: -1,
                plate: ""
            },
            {
                location: -1,
                predictTime: -1,
                remainSeats: -1,
                plate: ""
            }
        ]
    };


    switch (busType) {
        case 1:
            busInfo.stationId = "120000059";
            busInfo.stationNumber = "89027";
            busInfo.stationName = "사당역";

            busInfo.destinationName = "수원행";

            busInfo.routeId = "200000149";
            busInfo.routeName = "7790"
            break;
        case 2:
            busInfo.stationId = "200000162";
            busInfo.stationNumber = "01013";
            busInfo.stationName = "성균관대역";

            busInfo.destinationName = "사당행";

            busInfo.routeId = "200000149";
            busInfo.routeName = "7790"
            break;
        case 3:
            busInfo.stationId = "120000059";
            busInfo.stationNumber = "89027";
            busInfo.stationName = "사당역";

            busInfo.destinationName = "수원행";

            busInfo.routeId = "200000150";
            busInfo.routeName = "7800"
            break;
        case 4:
            busInfo.stationId = "200000162";
            busInfo.stationNumber = "01013";
            busInfo.stationName = "성균관대역";

            busInfo.destinationName = "사당행";

            busInfo.routeId = "200000150";
            busInfo.routeName = "7800"
            break;
        case 5:
            busInfo.stationId = "121000921";
            busInfo.stationNumber = "91200";
            busInfo.stationName = "강남역나라빌딩앞";

            busInfo.destinationName = "수원행";

            busInfo.routeId = "200000108";
            busInfo.routeName = "3003"
            break;
        case 6:
            busInfo.stationId = "200000104";
            busInfo.stationNumber = "01020";
            busInfo.stationName = "성균관대역,고용노동부경기지청.율전성당";

            busInfo.destinationName = "강남행";

            busInfo.routeId = "200000108";
            busInfo.routeName = "3003"
            break;
        default:
            callback(busInfo);
            return;
            break;
    }

    let requestURL = APIURL + "?serviceKey=" + APIKey;
    requestURL += "&stationId=" + busInfo.stationId;
    requestURL += "&routeId=" + busInfo.routeId;

    request(
        {
            url: requestURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (!error) {
                if (response.statusCode == 200) {
                    xmlParser(body, (error, result) => {
                        if ('msgBody' in result.response) {
                            const infoObj = result.response.msgBody[0].busArrivalItem[0];

                            busInfo.resultArray[0].location = infoObj.locationNo1 * 1;
                            busInfo.resultArray[0].predictTime = infoObj.predictTime1 * 1;
                            busInfo.resultArray[0].remainSeats = infoObj.remainSeatCnt1 * 1;
                            busInfo.resultArray[0].plate = infoObj.plateNo1;
                            busInfo.resultArray[1].location = infoObj.locationNo2 * 1;
                            busInfo.resultArray[1].predictTime = infoObj.predictTime2 * 1;
                            busInfo.resultArray[1].remainSeats = infoObj.remainSeatCnt2 * 1;
                            busInfo.resultArray[1].plate = infoObj.plateNo2;
                        }
                    });
                }
            }
            callback(busInfo);
        }
    );
};

//// https://kingom.skku.edu/skkuapp/getBusData.do?route=2009 ////
//// 2009: 인문캠 2002: 자과-사당 2004: 자과-분당
exports.getSuttle = (route, callback) => {
    const suttleURL = "https://kingom.skku.edu/skkuapp/getBusData.do?route=" + route;

    request(
        {
            url: suttleURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback({});
            }
            else if (response.statusCode !== 200) {
                callback({});
            }
            else {
                callback(JSON.parse(body).items);
            }
        }
    );
}

exports.getSuttleInfo = (callback) => {
    suttleInfo = {
        url0: "",
        url01: "",
        url1: ""
    }

    suttleInfoURL = "https://www.skku.edu/skku/mobile/bus.do";
    request(
        {
            url: suttleInfoURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(suttleInfo);
            }
            else if (response.statusCode !== 200) {
                callback(suttleInfo);
            }
            else {
                crawler.setTargetStr(body);
                suttleInfo.url0 = "https://www.skku.edu/skku/mobile/bus.do?mode=hView&"+crawler.getBetween('href="?mode=hView&amp;', '"');
                suttleInfo.url01 = "https://www.skku.edu/skku/mobile/bus.do?mode=hnView&"+crawler.getBetween('href="?mode=hnView&amp;', '"');
                suttleInfo.url1 = "https://www.skku.edu/skku/mobile/bus.do?mode=nView&"+crawler.getBetween('href="?mode=nView&amp;', '"');

                callback(suttleInfo);
            }
        }
    );
}