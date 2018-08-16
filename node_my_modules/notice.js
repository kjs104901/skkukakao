const request = require('request');

const { crawler } = require('./util.js');

const universityNoticeURLList = [
    {
        name: "학부",
        url: "http://hakbu.skku.edu/hakbu/menu_7/sub_07_01.jsp"
    },
    {
        name: "유학",
        url: "http://scos.skku.edu/scos/menu_4/sub_04_01_01.jsp"
    },
    {
        name: "문과",
        url: "http://liberalarts.skku.edu/liberal/menu_10/data_01.jsp"
    },
    {
        name: "사회과학",
        url: "http://sscience.skku.edu/sscience/menu_4/sub4_1.jsp"
    },
    {
        name: "경제",
        url: "http://ecostat.skku.edu/ecostat/menu_6/sub6_1.jsp"
    },
    {
        name: "경영",
        url: "https://biz.skku.edu/kr/boardList.do?bbsId=BBSMSTR_000000000002"
    },
    {
        name: "사범",
        url: "http://coe.skku.edu/coe/menu_2/sub_02_7_1.jsp"
    },
    {
        name: "예술",
        url: "http://art.skku.edu/art/menu_4/sub4_1.jsp"
    },
    {
        name: "자연과학",
        url: "http://cscience.skku.edu/cscience_kor/menu_5/sub5_3.jsp"
    },
    {
        name: "정보통신",
        url: "http://icc.skku.ac.kr/icc_new/board_list_square?boardName=board_notice"
    },
    {
        name: "소프트웨어",
        url: "http://cs.skku.edu/open/notice/list"
    },
    {
        name: "공과",
        url: "http://shb.skku.edu/enc/menu_6/sub6_2.jsp"
    },
    {
        name: "약학",
        url: "http://pharm.skku.edu/board/board.jsp?catg=notice	"
    },
    {
        name: "생명공학",
        url: "https://skb.skku.edu/biotech/community/under_notice.do"
    },
    {
        name: "스포츠과학",
        url: "http://sport.skku.edu/sports/menu_4/sub4_1.jsp"
    },
    {
        name: "의과",
        url: "http://www.skkumed.ac.kr/notice.asp"
    },
    {
        name: "성균융합원",
        url: "http://icon.skku.edu/icon/menu_5/sub5_1.jsp"
    }
];


exports.getNoticeList = (type, offset, callback) => {
    let noticeObj = {
        list: [],
        last: 0
    }

    let noticeURL = "https://www.skku.edu/skku/campus/skk_comm/notice0"
    noticeURL += type + ".do?mode=list&&articleLimit=10";
    noticeURL += "&article.offset=" + offset;

    request(
        {
            url: noticeURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(noticeObj);
            }
            else if (response.statusCode !== 200) {
                callback(noticeObj);
            }
            else {
                crawler.setTargetStr(body);
                const tbodyStr = crawler.getBetween("<tbody>", "</tbody>");
                const pageingStr = crawler.getBetween('<ul class="paging">', "</ul>");

                let trStrList = [];
                crawler.setTargetStr(tbodyStr);
                while (-1 < crawler.getTargetStr().indexOf("<tr")) {
                    const trStr = crawler.getBetweenMoveTarget("<tr", "</tr>");
                    trStrList.push(trStr);
                }
                trStrList.forEach(trStr => {
                    crawler.setTargetStr(trStr);

                    let ntc = {
                        no: 0,
                        title: "",
                        url: "",
                        date: "",
                        attachment: []
                    };

                    let column = 0;
                    while (-1 < crawler.getTargetStr().indexOf("<td")) {
                        crawler.moveTargetAfter("<td")
                        const tdStr = crawler.getBetweenMoveTarget(">", "</td>");
                        if (column === 0) {
                            let noTmp = tdStr;
                            noTmp = noTmp.replace(/\r/g, "");
                            noTmp = noTmp.replace(/\n/g, "");
                            noTmp = noTmp.replace(/\t/g, "");
                            noTmp = noTmp.replace(/ /g, "");
                            ntc.no = noTmp * 1;
                        }
                        else if (column === 1) {
                            const tmpStr = crawler.getTargetStr();

                            crawler.setTargetStr(tdStr);
                            let ntcURL = crawler.getBetweenMoveTarget('href="', '"');
                            ntcURL = ntcURL.replace(/&amp;/g, "&");
                            ntc.url = "https://www.skku.edu/skku/campus/skk_comm/notice0" + type + ".do" + ntcURL;

                            let titleTmp = crawler.getBetween('>', '<');
                            titleTmp = titleTmp.replace(/\r/g, "");
                            titleTmp = titleTmp.replace(/\n/g, "");
                            titleTmp = titleTmp.replace(/\t/g, "");
                            titleTmp = titleTmp.replace(/  /g, "");
                            titleTmp = titleTmp.replace(/&#034;/g, '"');
                            titleTmp = titleTmp.replace(/&gt;/g, '>');
                            titleTmp = titleTmp.replace(/&lt;/g, '<');
                            titleTmp = titleTmp.replace(/&amp;/g, '&');
                            titleTmp = titleTmp.replace(/&#039;/g, "'");
                            ntc.title = titleTmp

                            crawler.setTargetStr(tmpStr);
                        }
                        else if (column === 2) { ntc.date = tdStr }
                        else if (column === 4) {
                            const tmpStr = crawler.getTargetStr();

                            crawler.setTargetStr(tdStr);
                            const fileListStr = crawler.getBetween('<ul class="filedown_list">', "</ul>");
                            crawler.setTargetStr(fileListStr);
                            while (-1 < crawler.getTargetStr().indexOf('href="')) {
                                const fileURLStr = crawler.getBetweenMoveTarget('href="', '"');
                                let fileName = crawler.getBetweenMoveTarget('>', '<');
                                fileName = fileName.replace(/\r/g, "");
                                fileName = fileName.replace(/\n/g, "");
                                fileName = fileName.replace(/\t/g, "");

                                let fileURL = "https://www.skku.edu/skku/campus/skk_comm/notice0" + type + ".do" + fileURLStr;
                                fileURL = fileURL.replace(/&amp;/g, "&");

                                ntc.attachment.push({
                                    name: fileName,
                                    url: fileURL
                                });
                            }
                            crawler.setTargetStr(tmpStr);
                        }

                        column += 1;
                    }

                    if (0 < ntc.title.length) {
                        noticeObj.list.push(ntc);
                    }
                });

                let maxOffset = 0;
                crawler.setTargetStr(pageingStr);
                while (-1 < crawler.getTargetStr().indexOf("article.offset=")) {
                    const offsetTmp = crawler.getBetweenMoveTarget('article.offset=', '"') * 1;
                    if (maxOffset < offsetTmp) {
                        maxOffset = offsetTmp;
                    }
                }
                noticeObj.last = maxOffset;

                callback(noticeObj);
            }
        }
    );
}

exports.getNotice = (noticeURL, callback) => {
    let notice = {
        title: "",
        body: "",
        attachment: []
    };
    request(
        {
            url: noticeURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(notice);
            }
            else if (response.statusCode !== 200) {
                callback(notice);
            }
            else {
                crawler.setTargetStr(body);

                const theadStr = crawler.getBetween('<em class="ellipsis">', "</em>");
                const attachmentStr = crawler.getBetween('<ul class="filedown_list">', "</ul>");
                let tbodyStr = crawler.getBetween('<dd>', "</dd>");
                tbodyStr = tbodyStr.replace(/src="/g, 'src="https://www.skku.edu');


                notice.title = theadStr;
                notice.body = tbodyStr;

                crawler.setTargetStr(attachmentStr);
                while (-1 < crawler.getTargetStr().indexOf('href="')) {
                    const fileURLStr = crawler.getBetweenMoveTarget('href="', '"');
                    let fileName = crawler.getBetweenMoveTarget('>', '<');
                    fileName = fileName.replace(/\r/g, "");
                    fileName = fileName.replace(/\n/g, "");
                    fileName = fileName.replace(/\t/g, "");

                    let fileURL = "https://www.skku.edu/skku/campus/skk_comm/notice01.do" + fileURLStr;
                    fileURL = fileURL.replace(/&amp;/g, "&");

                    notice.attachment.push({
                        name: fileName,
                        url: fileURL
                    });
                }
                callback(notice);
            }
        }
    );
}

exports.getDomNoticeList = (campusType, offset, callback) => {
    let noticeObj = {
        list: [],
        last: 0
    }

    let domNoticeURL = "https://dorm.skku.edu/"
    if (campusType === 0) {
        domNoticeURL += "skku_seoul/";
    }
    else if (campusType === 1) {
        domNoticeURL += "skku/";
    }
    domNoticeURL += "notice/notice_all.jsp?mode=list";
    domNoticeURL += "&pager.offset=" + offset;

    request(
        {
            url: domNoticeURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(noticeObj);
            }
            else if (response.statusCode !== 200) {
                callback(noticeObj);
            }
            else {

                crawler.setTargetStr(body);
                const tbodyStr = crawler.getBetween("<tbody>", "</tbody>");
                const pageingStr = crawler.getBetween('<div class="paging">', "</html>");

                let trStrList = [];
                crawler.setTargetStr(tbodyStr);
                while (-1 < crawler.getTargetStr().indexOf("<tr")) {
                    const trStr = crawler.getBetweenMoveTarget("<tr", "</tr>");
                    trStrList.push(trStr);
                }

                trStrList.forEach(trStr => {
                    crawler.setTargetStr(trStr);

                    let ntc = {
                        no: 0,
                        type: "",
                        title: "",
                        url: "",
                        date: "",
                        attachment: false
                    };

                    let column = 0;
                    while (-1 < crawler.getTargetStr().indexOf("<td")) {
                        crawler.moveTargetAfter("<td")
                        const tdStr = crawler.getBetweenMoveTarget(">", "</td>");
                        if (column === 0) {
                            let noTmp = tdStr;
                            noTmp = noTmp.replace(/\r/g, "");
                            noTmp = noTmp.replace(/\n/g, "");
                            noTmp = noTmp.replace(/\t/g, "");
                            noTmp = noTmp.replace(/ /g, "");
                            ntc.no = noTmp * 1;
                            if (!ntc.no) {
                                ntc.no = -1;
                            }
                        }
                        else if (column === 1) {
                            let typeTmp = tdStr;
                            typeTmp = typeTmp.replace(/\r/g, "");
                            typeTmp = typeTmp.replace(/\n/g, "");
                            typeTmp = typeTmp.replace(/\t/g, "");
                            typeTmp = typeTmp.replace(/ /g, "");
                            ntc.type = typeTmp
                        }
                        else if (column === 2) {
                            const tmpStr = crawler.getTargetStr();

                            crawler.setTargetStr(tdStr);
                            let ntcURL = crawler.getBetweenMoveTarget('href="', '"');
                            ntcURL = ntcURL.replace(/&amp;/g, "&");
                            if (campusType === 0) {
                                ntc.url = "https://dorm.skku.edu/skku_seoul/notice/notice_all.jsp" + ntcURL;
                            }
                            if (campusType === 1) {
                                ntc.url = "https://dorm.skku.edu/skku/notice/notice_all.jsp" + ntcURL;
                            }

                            let titleTmp = crawler.getBetween('>', '<');
                            titleTmp = titleTmp.replace(/\r/g, "");
                            titleTmp = titleTmp.replace(/\n/g, "");
                            titleTmp = titleTmp.replace(/\t/g, "");
                            titleTmp = titleTmp.replace(/  /g, "");
                            ntc.title = titleTmp

                            crawler.setTargetStr(tmpStr);
                        }
                        else if (column === 3) {
                            if (-1 < tdStr.indexOf("<img")) {
                                ntc.attachment = true;
                            }
                        }
                        else if (column === 4) { ntc.date = tdStr }

                        column += 1;
                    }

                    if (0 < ntc.title.length) {
                        noticeObj.list.push(ntc);
                    }
                });

                let maxOffset = 0;
                crawler.setTargetStr(pageingStr);
                while (-1 < crawler.getTargetStr().indexOf("pager.offset=")) {
                    const offsetTmp = crawler.getBetweenMoveTarget('pager.offset=', '"') * 1;
                    if (maxOffset < offsetTmp) {
                        maxOffset = offsetTmp;
                    }
                }
                noticeObj.last = maxOffset;

                callback(noticeObj);
            }
        }
    );
}

exports.getDomNotice = (noticeURL, callback) => {
    let notice = {
        title: "",
        body: "",
        attachment: []
    };
    request(
        {
            url: noticeURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(notice);
            }
            else if (response.statusCode !== 200) {
                callback(notice);
            }
            else {
                crawler.setTargetStr(body);

                crawler.moveTargetAfter("td title");
                let titleStr = crawler.getBetweenMoveTarget(">", "<");
                titleStr = titleStr.replace(/\r/g, "");
                titleStr = titleStr.replace(/\n/g, "");
                titleStr = titleStr.replace(/\t/g, "");
                titleStr = titleStr.replace(/  /g, "");
                notice.title = titleStr;

                while (-1 < crawler.getTargetStr().indexOf('<a href="/_custom/skku/_common/board/download.jsp?')) {
                    const attachNoStr = crawler.getBetweenMoveTarget('<a href="/_custom/skku/_common/board/download.jsp?', '"');
                    const attachURL = "https://dorm.skku.edu/_custom/skku/_common/board/download.jsp?" + attachNoStr;

                    let attachName = crawler.getBetweenMoveTarget('title="', ' 다운로드"');
                    attachName = attachName.replace(/&#40;/g, "(");
                    attachName = attachName.replace(/&#41;/g, ")");
                    attachName = attachName.replace(/&nbsp;/g," ");
                    attachName = attachName.replace(/&lt;/g,"<");
                    attachName = attachName.replace(/&gt;/g,">");
                    attachName = attachName.replace(/&amp;/g,"&");
                    attachName = attachName.replace(/&quot;/g,"\"");
                    attachName = attachName.replace(/&#035;/g,"#");
                    attachName = attachName.replace(/&#039;/g,"'");

                    notice.attachment.push({
                        name: attachName,
                        url: attachURL
                    });
                }

                crawler.moveTargetAfter('<div id="article_text"');
                let bodyStr = crawler.getBetween('>', "</td>");
                bodyStr = bodyStr.replace(/src="/g, 'src="https://dorm.skku.edu');
                notice.body = bodyStr;

                callback(notice);
            }
        }
    );
}

exports.getUniversityNoticeURL = (universityName) => {
    let url = "https://www.skku.edu/skku/campus/skk_comm/notice01.do"
    universityNoticeURLList.forEach(element => {
        if (-1 < universityName.indexOf(element.name)) {
            url = element.url;
        }
    });
    return url;
}