const request = require('request');


request(
    {
        url: "http://127.0.0.1/message",
        method: "POST",
        form: {
            type: "text",
            content: "법고을 식당"
        }
    },
    (error, response, body) => {
        console.log(body);
    }
);