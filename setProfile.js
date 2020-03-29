const request = require('request');
const covidModel = require('./models/covid19');

module.exports = function setProfile() {
    covidModel.findOne({ id: process.env.PAGE_ACCESS_TOKEN }, function (err, res) {
        if (!res) covidModel.create({ id: process.env.PAGE_ACCESS_TOKEN }, () => { });
    })
    let request_body = {
        "get_started": { "payload": "get_started" },
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": true,
                "call_to_actions": [
                    {
                        "title": "COVID-19",
                        "type": "postback",
                        "payload": "GET_COVID19"
                    },
                    {
                        "title": "Bộ Y Tế Việt Nam",
                        "type": "web_url",
                        "url": "https://ncov.moh.gov.vn/",
                        "webview_height_ratio": "tall"
                    },
                    {
                        "title": "Tác Giả",
                        "type": "web_url",
                        "url": "https://tronghieuit.com/",
                        "webview_height_ratio": "tall"
                    }
                ]
            }
        ]
    }
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messenger_profile",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Set Profile Success!')
        } else {
            console.error("Set Profile Error: " + err);
        }
    });
}