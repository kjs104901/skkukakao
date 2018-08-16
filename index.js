const http = require('http');
const { parse } = require('querystring');

// my modules
const meal = require("./node_my_modules/meal");
const library = require("./node_my_modules/library");
const weather = require("./node_my_modules/weather");
const notice = require("./node_my_modules/notice");
const transportation = require("./node_my_modules/transportation");
const calendar = require("./node_my_modules/calendar");

// server
const server = http.createServer();
server.on('request', (request, response) => {
    const { headers, method, url } = request;
    let body = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        //// --- response starts --- ////
        // header
        response.statusCode = 200;
        response.writeHead(200, { "Content-Type": "application/json" });

        // body
        let bodyString = ""
        if (method === "GET" && url === "/keyboard") {
            bodyString = onKeyboard();
            response.write(bodyString);
            response.end();
        }
        else if (method === "POST" && url === "/message") {
            const params = JSON.parse(body);
            onMessage(params, (result) => {
                response.write(result);
                response.end();
            });
        }
        else {
            response.write("SUCCESS");
            response.end();
        }

        response.on('error', (err) => {
            console.error(err);
        })
    });
});
server.listen(8012);

const menuList = [
    {
        name: "식당메뉴",
        subMenuString: "캠퍼스를 선택하세요",
        subMenuList: [
            {
                name: "인문캠(메뉴)",
                subMenuString: "식당을 선택하세요",
                subMenuList: [
                    { name: "패컬티 식당", func: getMenu, arg: 0 },
                    { name: "은행골", func: getMenu, arg: 1 },
                    { name: "법고을 식당", func: getMenu, arg: 2 },
                    { name: "옥류천 식당", func: getMenu, arg: 3 },
                    { name: "금잔디 식당", func: getMenu, arg: 4 },
                    { name: "명륜학사", func: getMenu, arg: 5 },
                    { name: "처음으로" }
                ]
            },
            {
                name: "자과캠(메뉴)",
                subMenuString: "식당을 선택하세요",
                subMenuList: [
                    { name: "학생회관 행단골", func: getMenu, arg: 6 },
                    { name: "교직원 식당", func: getMenu, arg: 7 },
                    { name: "공대 식당", func: getMenu, arg: 8 },
                    { name: "봉룡학사", func: getMenu, arg: 9 },
                    { name: "처음으로" }
                ]
            },
            { name: "처음으로" }
        ]
    },
    {
        name: "날씨",
        subMenuString: "캠퍼스를 선택하세요",
        subMenuList: [
            { name: "인문캠(날씨)", func: getWeather, arg: 0 },
            { name: "자과캠(날씨)", func: getWeather, arg: 1 },
            { name: "처음으로" }
        ]
    },
    {
        name: "도서관 자리",
        subMenuString: "캠퍼스를 선택하세요",
        subMenuList: [
            { name: "인문캠(자리)", func: getLibrary, arg: 0 },
            { name: "자과캠(자리)", func: getLibrary, arg: 1 },
            { name: "처음으로" }
        ]
    },
    {
        name: "실시간 지하철",
        subMenuString: "역과 방향을 선택하세요",
        subMenuList: [
            { name: "혜화 상행", func: getSubway, arg: 0 },
            { name: "혜화 하행", func: getSubway, arg: 1 },
            { name: "성대 상행", func: getSubway, arg: 2 },
            { name: "성대 하행", func: getSubway, arg: 3 },
            { name: "처음으로" }
        ]
    },
    {
        name: "셔틀 버스",
        subMenuString: "셔틀 노선을 선택하세요",
        subMenuList: [
            { name: "인문캠 순환", func: getSuttle, arg: 0 },
            { name: "인문 ↔ 자과", func: getSuttle, arg: 1 },
            { name: "자과 ↔ 사당", func: getSuttle, arg: 2 },
            { name: "자과 ↔ 분당", func: getSuttle, arg: 3 }
        ]
    },
    {
        name: "광역 버스",
        subMenuString: "버스 노선을 선택하세요",
        subMenuList: [
            { name: "자과 → 사당", func: getBus, arg: 1 },
            { name: "사당 → 자과", func: getBus, arg: 2 },
            { name: "자과 → 강남", func: getBus, arg: 3 },
            { name: "강남 → 자과", func: getBus, arg: 4 },
            { name: "처음으로" }
        ]
    },
    {
        name: "학사 공지", func: getNotice, arg: null
    },
    {
        name: "학사 일정", func: getCalendar, arg: null
    },
    {
        name: "킹고봇", func: getKingo, arg: null
    },
    {
        name: "커뮤니티", func: getCommunity, arg: null
    }
]

const emojiList = emoji_list = [
    "(하트뿅)",
    "(하하)",
    "(우와)",
    "(심각)",
    "(힘듦)",
    "(흑흑)",
    "(아잉)",
    "(찡긋)",
    "(뿌듯)",
    "(깜짝)",
    "(빠직)",
    "(짜증)",
    "(제발)",
    "(씨익)",
    "(신나)",
    "(헉)",
    "(열받아)",
    "(흥)",
    "(감동)",
    "(뽀뽀)",
    "(멘붕)",
    "(정색)",
    "(쑥스)",
    "(꺄아)",
    "(좋아)",
    "(굿)",
    "(훌쩍)",
    "(허걱)",
    "(부르르)",
    "(푸하하)",
    "(발그레)",
    "(수줍)",
    "(컴온)",
    "(졸려)"
]

// on events
function onKeyboard() {
    let buttons = [];
    menuList.forEach(menu => {
        buttons.push(menu.name);
    });

    return (
        JSON.stringify({
            type: "buttons",
            buttons: buttons
        })
    );
}

function onMessage(params, callback) {
    let resultObj = {
        message: {
            text: ""
        }
    };

    if (params.type === "text") {
        let foundMenu = findMenu(menuList, params.content);

        if (params.content === "처음으로") {
            const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            resultObj.message.text = "안녕하세요. 친절한 성톡씨입니다 " + emoji;

            let buttons = [];
            menuList.forEach(menu => {
                buttons.push(menu.name);
            });
            resultObj.keyboard = {
                type: "buttons",
                buttons: buttons
            };

            callback(JSON.stringify(resultObj));
        }
        else if (foundMenu) {
            if (foundMenu.subMenuList) {
                resultObj.message.text = foundMenu.subMenuString;
                resultObj.keyboard = {
                    type: "buttons",
                    buttons: foundMenu.subMenuList
                };

                callback(JSON.stringify(resultObj));
            }
            else if (foundMenu.func) {
                foundMenu.func(foundMenu.arg, (result) => {
                    resultObj.message.text = result.text;
                    if (result.message_button) {
                        resultObj.message.message_button = result.message_button;
                    }
                    if (result.photo) {
                        resultObj.message.photo = result.photo;
                    }

                    let buttons = [];
                    menuList.forEach(menu => {
                        buttons.push(menu.name);
                    });
                    resultObj.keyboard = {
                        type: "buttons",
                        buttons: buttons
                    };

                    callback(JSON.stringify(resultObj));
                });
            }
        }
        else {
            resultObj.message.text = "메뉴를 찾지 못했습니다.";

            let buttons = [];
            menuList.forEach(menu => {
                buttons.push(menu.name);
            });
            resultObj.keyboard = {
                type: "buttons",
                buttons: buttons
            };

            callback(JSON.stringify(resultObj));
        }
    }
}

function findMenu(menuList, menuName) {
    let foundMenu;
    menuList.forEach(menu => {
        if (menu.name === menuName) {
            if (menu.subMenuList) {
                let list = [];
                menu.subMenuList.forEach(menu => {
                    list.push(menu.name);
                });
                foundMenu = {
                    subMenuString: menu.subMenuString,
                    subMenuList: list
                }
            }
            else if (menu.func) {
                foundMenu = {
                    func: menu.func,
                    arg: menu.arg
                }
            }
        }
        if (menu.subMenuList) {
            let foundSubMenu = findMenu(menu.subMenuList, menuName);
            if (foundSubMenu) {
                if (foundSubMenu.subMenuList || foundSubMenu.func) {
                    foundMenu = foundSubMenu;
                }
            }
        }
    })
    return foundMenu;
}

// user functions
function getMenu(arg, callback) {
    let restaurant = {};
    switch (arg) {
        case 0:
            restaurant = { campusType: 0, name: '패컬티식당', conspaceCd: 10201030, srResId: 1 }
            break;
        case 1:
            restaurant = { campusType: 0, name: '은행골', conspaceCd: 10201031, srResId: 2 }
            break;
        case 2:
            restaurant = { campusType: 0, name: '법고을식당', conspaceCd: 10201034, srResId: 4 }
            break;
        case 3:
            restaurant = { campusType: 0, name: '옥류천식당', conspaceCd: 10201032, srResId: 5 }
            break;
        case 4:
            restaurant = { campusType: 0, name: '금잔디식당', conspaceCd: 10201033, srResId: 6 }
            break;
        case 5:
            restaurant = { campusType: 2, name: '명륜학사' }
            break;
        case 6:
            restaurant = { campusType: 1, name: '학생회관 행단골', conspaceCd: 20201104, srResId: 3 }
            break;
        case 7:
            restaurant = { campusType: 1, name: '교직원 식당', conspaceCd: 20201040, srResId: 11 }
            break;
        case 8:
            restaurant = { campusType: 1, name: '공대식당', conspaceCd: 20201097, srResId: 10 }
            break;
        case 9:
            restaurant = { campusType: 3, name: '봉룡학사' }
            break;

        default:
            break;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    let resultCount = 0;
    let resultB = [];
    let resultL = [];
    let resultD = [];

    let intvCount = 0;
    let intv = setInterval(() => {
        intvCount += 1;
        meal.getMealList(restaurant, "B", year, month, date, (result) => {
            resultCount += 1;
            resultB = result;
        })
        meal.getMealList(restaurant, "L", year, month, date, (result) => {
            resultCount += 1;
            resultL = result;
        })
        meal.getMealList(restaurant, "D", year, month, date, (result) => {
            resultCount += 1;
            resultD = result;
        })
        if (3 <= resultCount) {
            let resultString = "";
            resultString += year + "/" + month + "/" + date + "\n";

            resultString += "[아침]" + "\n";
            resultB.forEach(menu => {
                menu.menuList.forEach(menu => {
                    resultString += menu + "/";
                })
                resultString += "\n";
                if (menu.price) {
                    resultString += " - " + menu.price + "원" + "\n"
                }
                resultString += "\n";
            });
            if (resultB.length === 0) {
                resultString += "메뉴가 없습니다." + "\n\n";
            }

            resultString += "[점심]" + "\n";
            resultL.forEach(menu => {
                menu.menuList.forEach(menu => {
                    resultString += menu + "/";
                })
                resultString += "\n";
                if (menu.price) {
                    resultString += " - " + menu.price + "원" + "\n"
                }
                resultString += "\n";
            });
            if (resultL.length === 0) {
                resultString += "메뉴가 없습니다." + "\n\n";
            }

            resultString += "[저녁]" + "\n";
            resultD.forEach(menu => {
                menu.menuList.forEach(menu => {
                    resultString += menu + "/";
                })
                resultString += "\n";
                if (menu.price) {
                    resultString += " - " + menu.price + "원" + "\n"
                }
                resultString += "\n";
            });
            if (resultD.length === 0) {
                resultString += "메뉴가 없습니다.";
            }

            callback({ text: resultString });
            clearInterval(intv);
        }
        if (10 < intvCount) {
            clearInterval(intv);
        }
    }, 1000);
}

function getWeather(arg, callback) {
    weather.getWeather(arg, (result) => {
        if (result.weather.length === 0) {
            callback({ text: "날씨 정보 불러오기 실패" });
        }
        else {
            let resultString = "";
            const currentDate = new Date(result.date);
            const date = currentDate.getDate();
            const hours = currentDate.getHours();

            const weather = result.weather;

            resultString += "[현재 날씨]" + date + "일 " + hours + "시" + "\n";
            resultString += "온도: " + weather[0].currentTemp + "°" + "\n";
            resultString += "풍속: " + Math.floor(weather[0].windSpeed * 10) / 10 + "㎧" + "\n";
            resultString += "습도: " + weather[0].humidity + "%" + "\n";
            resultString += "\n";
            resultString += "[3시간 뒤]" + "\n";
            resultString += "일기: " + getSkyString(weather[1].sky, weather[1].prec, weather[1].wind) + "\n";
            resultString += "온도: " + weather[1].currentTemp + "°" + "\n";
            resultString += "강수확률: " + weather[1].precPercent + "%" + "\n";
            resultString += "[6시간 뒤]" + "\n";
            resultString += "일기: " + getSkyString(weather[2].sky, weather[2].prec, weather[2].wind) + "\n";
            resultString += "온도: " + weather[2].currentTemp + "°" + "\n";
            resultString += "강수확률: " + weather[2].precPercent + "%" + "\n";
            resultString += "[9시간 뒤]" + "\n";
            resultString += "일기: " + getSkyString(weather[3].sky, weather[3].prec, weather[3].wind) + "\n";
            resultString += "온도: " + weather[3].currentTemp + "°" + "\n";
            resultString += "강수확률: " + weather[3].precPercent + "%" + "\n";
            resultString += "[12시간 뒤]" + "\n";
            resultString += "일기: " + getSkyString(weather[4].sky, weather[4].prec, weather[4].wind) + "\n";
            resultString += "온도: " + weather[4].currentTemp + "°" + "\n";
            resultString += "강수확률: " + weather[4].precPercent + "%" + "\n";
            callback({ text: resultString });
        }
    });
}

function getSkyString(sky, prec, wind) {
    let skyString = "맑음";
    if (sky === 2) {
        skyString = "조금 흐림";
    }
    if (sky === 3) {
        skyString = "흐림";
    }
    if (sky === 4) {
        skyString = "매우 흐림";
    }
    if (prec === 1 || prec === 2) {
        skyString = "비";
    }
    else if (prec === 3 || prec === 4) {
        skyString = "눈";
    }

    if (14 <= wind) {
        skyString += " (바람 많음)";
    }
    return skyString;
}

function getLibrary(arg, callback) {
    library.getSeats(arg, (result) => {
        let resultString = "";
        result.forEach(room => {
            if (room.disablePeriod) {
                resultString += "# " + room.name + " 운영중지: " + room.disablePeriodName + "\n";
            }
            else {
                resultString += "# " + room.name + " [" + room.occupied + "/" + room.total + "] (" + room.percent + "%)" + "\n";
            }
        });
        callback({ text: resultString });
    })
}

function getSubway(arg, callback) {
    let campusType = 0;
    let direction = 0;
    if (arg === 2 || arg === 3) {
        campusType = 1;
    }
    if (arg === 1 || arg === 3) {
        direction = 1;
    }

    transportation.getSubway(campusType, direction, (result) => {
        let resultString = "";
        resultString += "# 전동차 운행상황에 따라 정보의 오차가 있을 수 있습니다" + "\n";
        for (let index = 0; index < result.referenceArray.length; index++) {
            let station = result.referenceArray[index];
            if (station.length === 0) {
                station = "  ↑  ";
            }

            let trainString = "";
            result.trainArray[index].forEach((train) => {
                trainString += train.destination + (train.isExpress ? "(급)" : "") + " ";
            });

            resultString += station + " - " + trainString + "\n";
        }
        callback({ text: resultString });
    })
}

function getSuttle(arg, callback) {
    let route = 2009;
    if (arg === 2) {
        route = 2002;
    }
    else if (arg === 3) {
        route = 2004;
    }

    if (arg === 1) {
        transportation.getSuttleInfo((result) => {
            callback({
                text: "실시간 운행 정보가 제공되지 않습니다.",
                message_button: {
                    label: "운행정보 확인",
                    url: result.url01
                }
            });
        })
    }
    else {
        transportation.getSuttle(route, (result) => {
            let resultString = "";

            let reversedSuttle = result.reverse();

            reversedSuttle.forEach((suttle) => {
                resultString += "  ↑      " + " - " + (suttle.kind == 3 ? "▲" + suttle.carNumber : "") + "\n"
                resultString += suttle.stationName + " - " + (suttle.kind == 2 || suttle.kind == 1 ? "▲" + suttle.carNumber : "") + "\n"
            });

            transportation.getSuttleInfo((result) => {
                let infoURL = result.url0
                if (arg === 2 || arg === 3) {
                    infoURL = result.url1
                }

                callback({
                    text: resultString,
                    message_button: {
                        label: "운행정보 확인",
                        url: infoURL
                    }
                })
            })
        })
    }
}

function getBus(type, callback) {
    let busList = [];
    let loadCount = 0;
    let loadCountMax = 1;
    let intvCount = 0;

    if (type === 1 || type === 2) {
        loadCountMax = 2;
    }

    if (type === 1) {
        transportation.getBus(2, (result) => {
            loadCount += 1;
            busList.push(result)
        })
        transportation.getBus(4, (result) => {
            loadCount += 1;
            busList.push(result)
        })
    }
    if (type === 2) {
        transportation.getBus(1, (result) => {
            loadCount += 1;
            busList.push(result)
        })
        transportation.getBus(3, (result) => {
            loadCount += 1;
            busList.push(result)
        })
    }
    if (type === 3) {
        transportation.getBus(6, (result) => {
            loadCount += 1;
            busList.push(result)
        })
    }
    if (type === 4) {
        transportation.getBus(5, (result) => {
            loadCount += 1;
            busList.push(result)
        })
    }

    let intv = setInterval(() => {
        intvCount += 1;
        if (loadCountMax <= loadCount) {
            let resultString = "";
            busList.forEach((route) => {
                resultString += route.routeName + " - " + route.stationName + " 출발 " + route.destinationName + "\n";

                route.resultArray.forEach((bus) => {
                    if (0 < bus.location) {
                        resultString += "[" + bus.plate + "]" + "\n";
                        resultString += bus.location + "정류장 전" + "\n";
                        resultString += "약 " + bus.predictTime + "분 후 도착" + "\n";
                        resultString += bus.remainSeats + "좌석 남음" + "\n";
                        resultString += "\n";
                    }
                })
                resultString += "\n";
            })
            callback({ text: resultString })
            clearInterval(intv);
        }
        if (10 < intvCount) {
            clearInterval(intv);
        }
    }, 1000)
}

function getNotice(arg, callback) {
    notice.getNoticeList(2, 0, (result) => {
        let resultString = "";
        result.list.forEach(noticeElement => {
            resultString += "# " + noticeElement.title.substr(0, 20) + "\n"
        });

        callback({
            text: resultString,
            message_button: {
                label: "웹에서 보기",
                url: "https://www.skku.edu/skku/campus/skk_comm/notice02.do"
            }
        })
    })
}

function getCalendar(arg, callback) {
    calendar.getTodayCalendar((result) => {
        let resultString = "";
        resultString += "[" + result.today + "]" + "\n";
        result.list.forEach(cal => {
            resultString += "# " + cal.title + "\n";
            resultString += " 시작 " + cal.startDate + "\n";
            resultString += " 종료 " + cal.endDate + "\n";
            resultString += "\n";
        });
        callback({
            text: resultString,
            message_button: {
                label: "전체일정 보기",
                url: "https://www.skku.edu/skku/edu/bachelor/ca_de_schedule.do"
            }
        })
    });
}

function getKingo(arg, callback) {
    callback({
        text: "킹고봇",
        message_button: {
            label: "바로가기",
            url: "http://kingo.skku.edu/chat"
        }
    })
}

function getCommunity(arg, callback) {
    let resultString = "";
    resultString += "대나무숲" + "\n";
    resultString += "https://www.facebook.com/SKKUBamboo/" + "\n";
    resultString += "\n";

    resultString += "에브리타임" + "\n";
    resultString += "https://everytime.kr/" + "\n";
    resultString += "\n";

    resultString += "성대사랑" + "\n";
    resultString += "http://www.skkulove.com" + "\n";
    resultString += "\n";

    resultString += "스꾸족보" + "\n";
    resultString += "https://skkujokbo.com/" + "\n";
    resultString += "\n";

    callback({
        text: resultString
    })
}