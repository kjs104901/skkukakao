const request = require('request');


request(
    {
        url: "http://127.0.0.1/message",
        method: "POST",
        form: {
            type: "text",
            content: "커뮤니티"
        }
    },
    (error, response, body) => {
        console.log(body);
    }
);