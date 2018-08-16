const request = require('request'); // to request http

const { crawler, xmlParser } = require('./util.js');

//// Must mention the site in App.
//// http://www.weather.go.kr/weather/forecast/timeseries.jsp ////
//// http://www.kma.go.kr/images/weather/lifenindustry/timeseries_XML.pdf ///
//// http://www.weather.go.kr/weather/lifenindustry/sevice_rss.jsp ////

exports.getWeather = (campusType, callback) => {
    const currentDate = new Date();
    let weatherURL = "";

    let resultArray = [];

    if (campusType === 0) {
        weatherURL = "http://www.kma.go.kr/wid/queryDFS.jsp?gridx=60&gridy=127";
    }
    else if (campusType === 1) {
        weatherURL = "http://www.kma.go.kr/wid/queryDFS.jsp?gridx=60&gridy=121";
    }
    else {
        callback({
            date: currentDate,
            weather: resultArray,
        });
        return;
    }

    request(
        {
            url: weatherURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (!error) {
                if (response.statusCode === 200) {
                    xmlParser(body, (error, result) => {
                        const date = result.wid.header[0].tm[0];

                        currentDate.setFullYear(date.substr(0, 4) * 1);
                        currentDate.setMonth(date.substr(4, 2) * 1);
                        currentDate.setDate(date.substr(6, 2) * 1);
                        currentDate.setHours(date.substr(8, 2) * 1);

                        const weatherArray = result.wid.body[0].data;

                        weatherArray.forEach(weatherObject => {
                            resultArray.push(
                                {
                                    hour: weatherObject.hour[0], // hours
                                    day: weatherObject.day[0], // 0:today 1:tomorrow 2:dayafterTom // sometimes wrong
                                    currentTemp: weatherObject.temp[0], // current temperature
                                    maxTemp: weatherObject.tmx[0], // day's maximum temperature
                                    minTemp: weatherObject.tmn[0], // day's minimum temperature
                                    sky: weatherObject.sky[0], // 1맑음 2구름조금 3구름많음 4흐림
                                    prec: weatherObject.pty[0], // 0없음 1비 2비/눈 3눈/비 4눈
                                    precPercent: weatherObject.pop[0], // 강수 확률
                                    rain12: weatherObject.r12[0],//12시간 예상 강수량
                                    snow12: weatherObject.s12[0],//12시간 예상 적설량
                                    windSpeed: weatherObject.ws[0],
                                    humidity: weatherObject.reh[0]
                                }
                            )
                        });
                    });
                }
            }
            callback({
                date: currentDate,
                weather: resultArray,
            });
        }
    );
};
