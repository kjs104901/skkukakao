const request = require('request');
const fs = require('fs');
const { machineIdSync } = require('node-machine-id');

/* -------------- Requests -------------- */
let cookieJar = request.jar();

const normalHeader = {
    "User-Agent" : "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36"
};

let icampusRefererHeader = {
    "User-Agent" : "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36",
    Referer: "http://www.icampus.ac.kr/front/login/loginAction.do?method=list"
}

const mobileHeader = {
    "User-Agent" : "Mozilla/5.0 (Linux; Android 6.0.1; Z832 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36"
}

let libraryHeader = {
    "User-Agent" : "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36"
};

let targetStr = "";

exports.crawler = {
    setTargetStr: (newStr) => {
        targetStr = newStr;
    },

    getTargetStr: () => {
        return targetStr;
    },

    getBetweenMoveTarget: (startStr, endStr) => {
        const startIndex = targetStr.indexOf(startStr);
        if (startIndex === -1) {
            return "";
        }
        const endIndex = targetStr.indexOf(endStr, startIndex + startStr.length);
        if (endIndex === -1) {
            return "";
        }
        let returnStr = targetStr.substring(startIndex + startStr.length, endIndex);
        targetStr = targetStr.substring(endIndex + endStr.length);

        return returnStr;
    },

    getBetween: (startStr, endStr) => {
        const startIndex = targetStr.indexOf(startStr);
        if (startIndex === -1) {
            return "";
        }
        const endIndex = targetStr.indexOf(endStr, startIndex + startStr.length);
        if (endIndex === -1) {
            return "";
        }
        let returnStr = targetStr.substring(startIndex + startStr.length, endIndex);
        return returnStr;
    },

    getAfter: (endStr) => {
        const endIndex = targetStr.indexOf(endStr);
        if (endIndex === -1) {
            return "";
        }
        let returnStr = targetStr.substring(endIndex + endStr.length);
        return returnStr;
    },

    getUntil: (endStr) => {
        const endIndex = targetStr.indexOf(endStr);
        if (endIndex === -1) {
            return "";
        }

        let returnStr = targetStr.substring(0, endIndex);
        return returnStr;
    },

    moveTargetAfter: (endStr) => {
        const endIndex = targetStr.indexOf(endStr);
        if (endIndex === -1) {
            return false;
        }
        targetStr = targetStr.substring(endIndex + endStr.length);
        return true;
    },

    getNormalHeader: () => {
        return normalHeader;
    },
    
    getIcampusRefererHeader: () => {
        return icampusRefererHeader;
    },

    getMobileHeader: () => {
        return mobileHeader;
    },

    getLibraryHeader: () => {
        return libraryHeader;
    },

    setLibraryHeaderAccessToken: (accessToken) => {
        libraryHeader['pyxis-auth-token'] = accessToken;
    },

    getCookieJar: () => {
        return cookieJar;
    },

    decodeHTML: (inputStr) => {
        let outputStr = inputStr;
        outputStr = outputStr.replace(/\r/g,"");
        outputStr = outputStr.replace(/\n/g,"");
        outputStr = outputStr.replace(/\t/g,"");
        outputStr = outputStr.replace(/<b>/g,"");
        outputStr = outputStr.replace(/<\/b>/g,"");
        outputStr = outputStr.replace(/&nbsp;/g," ");
        outputStr = outputStr.replace(/&lt;/g,"<");
        outputStr = outputStr.replace(/&gt;/g,">");
        outputStr = outputStr.replace(/&amp;/g,"&");
        outputStr = outputStr.replace(/&quot;/g,"\"");
        outputStr = outputStr.replace(/&#035;/g,"#");
        outputStr = outputStr.replace(/&#039;/g,"'");
        return outputStr;
    } 
}



/* -------------- Config -------------- */
const configFile = `${__dirname}/.config.json`;
const config = JSON.parse(fs.readFileSync(configFile));

exports.getConfig = (key) => {
    return config[key];
};


/* -------------- XML -------------- */
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
exports.xmlParser = parser.parseString;


/* -------------- Cryption -------------- */
const crypto = require("crypto");
exports.encrypt = (text) => {
    const key = machineIdSync(false).substr(0, 32);
    const iv = config["secretAESIV"];
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedText = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return encryptedText;
};

exports.decrypt = (text) => {
    const key = machineIdSync(false).substr(0, 32);
    const iv = config["secretAESIV"];
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decryptedText = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
    return decryptedText;
};

/* -------------- Setting Save -------------- */
const settingFile = `${__dirname}/.setting.json`;

exports.saveSetting = (key, value) => {
    let setting = {};
    if (fs.existsSync(settingFile)) {
        setting = JSON.parse(fs.readFileSync(settingFile));
    }
    setting[key] = value;
    fs.writeFileSync(settingFile, JSON.stringify(setting));
}

exports.loadSetting = (key) => {
    let setting = JSON.parse(fs.readFileSync(settingFile));
    if (key in setting){
        return setting[key];
    }
    else {
        return null;
    }
};