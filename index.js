const http = require('http');
const { parse } = require('querystring');

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
        }
        else if (method === "POST" && url === "/message") {
            const params = parse(body);
            bodyString = onMessage(params);
        }

        response.write(bodyString);

        // send
        response.end();
    });
});
server.listen(80);

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
                    { name: "명륜학사", func: getMenu, arg: 5 }
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
                ]
            }
        ]
    },
    {
        name: "날씨",
        subMenuString: "캠퍼스를 선택하세요",
        subMenuList: [
            { name: "인문캠(날씨)", func: getWeather, arg: 0 },
            { name: "자과캠(날씨)", func: getWeather, arg: 1 }
        ]
    },
    {
        name: "도서관 자리",
        subMenuString: "캠퍼스를 선택하세요",
        subMenuList: [
            { name: "인문캠(자리)", func: getLibrary, arg: 0 },
            { name: "자과캠(자리)", func: getLibrary, arg: 1 }
        ]
    },
    {
        name: "실시간 지하철",
        subMenuString: "역과 방향을 선택하세요",
        subMenuList: [
            { name: "혜화 상행", func: getSubway, arg: 0 },
            { name: "혜화 하행", func: getSubway, arg: 1 },
            { name: "성대 상행", func: getSubway, arg: 2 },
            { name: "성대 하행", func: getSubway, arg: 3 }
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
            { name: "자과 → 사당", func: getBus, arg: 0 },
            { name: "사당 → 자과", func: getBus, arg: 1 },
            { name: "자과 → 강남", func: getBus, arg: 2 },
            { name: "강남 → 자과", func: getBus, arg: 3 }
        ]
    },
    {
        name: "학교 공지사항", func: getNotice, arg: null
    },
    {
        name: "학사 일정", func: getCalendar, arg: null
    },
    {
        name: "킹고앱", func: getKingo, arg: null
    },
    {
        name: "커뮤니티", func: getCommunity, arg: null
    }
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

function onMessage(params) {
    let resultObj = {
        message: {
            text: ""
        }
    };

    if (params.type === "text") {
        let foundMenu = findMenu(menuList, params.content);
        if (foundMenu) {
            if (foundMenu.subMenuList) {
                resultObj.message.text = foundMenu.subMenuString;
                resultObj.keyboard = {
                    type: "buttons",
                    buttons: foundMenu.subMenuList
                };
            }
            else if (foundMenu.func) {
                resultObj.message.text = foundMenu.func(foundMenu.arg);
                if (foundMenu.message_button) {
                    resultObj.message.message_button = foundMenu.message_button;
                }

                let buttons = [];
                menuList.forEach(menu => {
                    buttons.push(menu.name);
                });
                resultObj.keyboard = {
                    type: "buttons",
                    buttons: buttons
                };
            }
        }
    }

    return (JSON.stringify(resultObj));
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

function getMenu(arg) {
    return {
        "text": "getMenu " + arg
    }
}

function getWeather(arg) {
    return {
        "text": "getWeather " + arg
    }
}

function getLibrary(arg) {
    return {
        "text": "getLibrary " + arg
    }
}

function getSubway(arg) {
    return {
        "text": "getSubway " + arg
    }
}

function getSuttle(arg) {
    return {
        "text": "getSuttle " + arg
    }
}

function getBus(arg) {
    return {
        "text": "getBus " + arg
    }
}

function getNotice(arg) {
    return {
        "text": "getNotice " + arg
    }
}

function getCalendar(arg) {
    return {
        "text": "getCalendar " + arg
    }
}

function getKingo(arg) {
    return {
        "text": "getKingo " + arg
    }
}

function getCommunity(arg) {
    return {
        "text": "getCommunity " + arg
    }
}