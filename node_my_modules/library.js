const request = require('request'); // to request http

const { crawler } = require('./util.js');

let userCampusType = 0;
let userUniversity = "";

const fs = require('fs');

exports.getSeats = (campusType, callback) => {
    let seatsUrl = "";

    if (campusType === 0) {
        seatsUrl = "http://lib.skku.edu/smufu-api/mo/1/rooms-at-seat?buildingId=1&roomTypeId=2";
    }
    else if (campusType === 1) {
        seatsUrl = "http://lib.skku.edu/smufu-api/mo/2/rooms-at-seat?buildingId=3&roomTypeId=2";
    }
    else {
        return;
    }

    request(
        {
            url: seatsUrl,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback([]);
                return;
            }
            else if (response.statusCode === 200) {
                const resultJson = JSON.parse(body);
                const resultNumber = resultJson.data.totalCount;
                const resultArray = resultJson.data.list;

                if (0 < resultNumber) {
                    let finalArray = resultArray.map((obj) => {
                        let beginTime = "";
                        let endTime = "";
                        if (obj.periodSeatChargeRule) {
                            beginTime = obj.periodSeatChargeRule.beginTime;
                            endTime = obj.periodSeatChargeRule.endTime;
                        }

                        let disablePeriod = false;
                        let disablePeriodName = "";
                        if (obj.disablePeriod) {
                            disablePeriod = true;
                            disablePeriodName = obj.disablePeriod.name;
                        }

                        let percent = 0;
                        if (0 < obj.total) {
                            percent = Math.floor(obj.occupied / obj.total * 100);
                        }

                        return {
                            name: obj.room.name,
                            isActive: obj.room.isActive,
                            total: obj.total,
                            occupied: obj.occupied,
                            percent: percent,
                            beginTime: beginTime,
                            endTime: endTime,
                            disablePeriod: disablePeriod,
                            disablePeriodName: disablePeriodName
                        };
                    });
                    callback(finalArray);
                }
                else {
                    callback([]);
                }
            }
            else {
                callback([]);
            }
        }
    );
}

exports.loginDirect = (userId, userPass, callback) => {
    const loginURL = "https://lib.skku.edu/pyxis-api/api/login";
    const loginJson = {
        loginId: userId,
        password: userPass
    }
    
    request(
        {
            url: loginURL,
            headers: crawler.getLibraryHeader(),
            method: "POST",
            json: loginJson,
            jar: crawler.getCookieJar()
        },
        loginCallback
    );
    function loginCallback(error, response, body) {
        if (error) {
            callback(false);
        }
        else if (response.statusCode !== 200) {
            callback(false);
        }
        else if (body.code !== 'success.loggedIn') {
            callback(false);
        }
        else {
            if (body.data.branch.id === 2) {
                userCampusType = 1;
            }
            if (body.data.parentDept) {
                userUniversity = body.data.parentDept.name
            }
            crawler.setLibraryHeaderAccessToken(body.data.accessToken)
            callback(true);
        }
    }
}

exports.loginCheck = (callback) => {
    const loginCheckURL = "https://lib.skku.edu/pyxis-api/2/api/my-info";

    request(
        {
            url: loginCheckURL,
            headers: crawler.getLibraryHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        loginCheckCallback
    );
    function loginCheckCallback(error, response, body) {
        const bodyJson = JSON.parse(body);
        if (error) {
            callback(false);
        }
        else if (response.statusCode !== 200) {
            callback(false);
        }
        else if (bodyJson.code !== 'success.retrieved') {
            callback(false);
        }
        else {
            callback(true);
        }
    }
}

exports.getCampusType = () => {
    return userCampusType;
}

exports.getUniversity = () => {
    return userUniversity;
}

exports.getHold = (callback) => {
    const holdURL = "https://lib.skku.edu/pyxis-api/2/api/holds?max=1000";

    request(
        {
            url: holdURL,
            headers: crawler.getLibraryHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        holdCallback
    );
    function holdCallback(error, response, body) {
        const bodyJson = JSON.parse(body);
        if (error) {
            callback([]);
        }
        else if (response.statusCode !== 200) {
            callback([]);
        }
        else if (bodyJson.code !== 'success.retrieved') {
            callback([]);
        }
        else {
            callback(bodyJson.data.list);
        }
    }
}

exports.getCharge = (callback) => {
    const chargeURL = "https://lib.skku.edu/pyxis-api/2/api/charges?max=1000";

    request(
        {
            url: chargeURL,
            headers: crawler.getLibraryHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        chargeCallback
    );
    function chargeCallback(error, response, body) {
        const bodyJson = JSON.parse(body);
        if (error) {
            callback([]);
        }
        else if (response.statusCode !== 200) {
            callback([]);
        }
        else if (bodyJson.code !== 'success.retrieved') {
            callback([]);
        }
        else {
            callback(bodyJson.data.list);
        }
    }
}

exports.getOverDue = (callback) => {
    let overDueList = [];
    const chargeURL = "https://lib.skku.edu/pyxis-api/2/api/charges?max=1000";

    request(
        {
            url: chargeURL,
            headers: crawler.getLibraryHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        chargeCallback
    );
    function chargeCallback(error, response, body) {
        const bodyJson = JSON.parse(body);
        if (error) {
            callback([]);
        }
        else if (response.statusCode !== 200) {
            callback([]);
        }
        else if (bodyJson.code !== 'success.retrieved') {
            callback([]);
        }
        else {
            bodyJson.data.list.forEach(element => {
                if (0 < element.overdueDays) {
                    overDueList.push();
                }
            });
            callback(overDueList);
        }
    }
}

/// gate
const gatePath = __dirname + "/gate/library.html";
exports.setGate = (gate) => {
    let gateStr = fs.readFileSync(gatePath, {encoding : "utf8"}).split("// data //");
    gateStr[1] = '\n';
    gateStr[1] += 'D0: "'+gate.D0+'",\n';
    gateStr[1] += 'D1: "'+gate.D1+'",\n';
    gateStr[1] += 'D2: "'+gate.D2+'",\n';
    gateStr[1] += 'D3: "'+gate.D3+'",\n';
    gateStr[1] += 'userid: "'+gate.userid+'",\n';
    gateStr[1] += 'roundkey: "'+gate.roundkey+'",\n';
    gateStr[1] += 'color_style: "'+gate.color_style+'",\n';
    gateStr[1] += '\n';

    const newGateStr = gateStr.join("// data //");
    fs.writeFileSync(gatePath, newGateStr);
};

exports.getGatePath = () => {
    return gatePath;
}

exports.clearGatePath = () => {
    let gateStr = fs.readFileSync(gatePath, {encoding : "utf8"}).split("// data //");
    gateStr[1] = '\n';

    const newGateStr = gateStr.join("// data //");
    fs.writeFileSync(gatePath, newGateStr);
}