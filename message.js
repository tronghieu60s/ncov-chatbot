const request = require('request');
const { apiCovid19 } = require('./api/callApi');
const formatDate = require('./formatDate');
const covidModel = require('./models/covid19');
const usersModel = require('./models/users');

function handleMessage(sender_psid, received_message) {
    usersModel.findOne({ sender_psid }, function (err, user) {
        if (!user) usersModel.create({ sender_psid }, () => { })
    })
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;
    let payload = received_postback.payload;
    switch (payload) {
        case "get_started":
            usersModel.findOne({ sender_psid }, function (err, user) {
                if (!user) usersModel.create({ sender_psid }, (err) => {
                    let response = {
                        "text": `Chào mừng bạn đến với BOT COVID-19 🦠🦠🦠\nHệ thống cập nhật dữ liệu mỗi 5 phút. Sẽ thông báo cho bạn nếu có ca nhiễm mới.`
                    }
                    if (!err) callSendAPI(sender_psid, response);
                })
            })
            break;
        case "GET_COVID19":
            apiCovid19().then(res => {
                let date = new Date();
                covidModel.findOneAndUpdate({ id: process.env.PAGE_ACCESS_TOKEN }, { data: res, date }, (err) => {
                    if (!err) {
                        response = {
                            "text": `⚠️⚠️⚠️ THÔNG BÁO TÌNH HÌNH DỊCH VIÊM PHỔI CẤP DO CHỦNG MỚI CỦA VIRUS CORONA 🦠🦠🦠\n➖ Số người nhiễm: ${res.data.global.cases}\n➖ Tử vong: ${res.data.global.deaths}\n➖ Bình phục: ${res.data.global.recovered}`
                        }
                        callSendAPI(sender_psid, response);
                        setTimeout(function () {
                            response = {
                                "text": `Số ca mắc COVID-19 tại Việt Nam có chiều hướng gia tăng: \n⚠️ Nhiễm bệnh: ${res.data.vietnam.cases}\n☠️ Tử vong: ${res.data.vietnam.deaths}\n🍀 Bình phục: ${res.data.vietnam.recovered}\n\n⏱ Cập nhật vào lúc: ${formatDate(date)}\n☑️ Dữ liệu được cập nhật mỗi 5 phút.`
                            }
                            callSendAPI(sender_psid, response);
                        }, 800)
                        setTimeout(function () {
                            let top_country = "";
                            for (let index = 0; index < res.data.countries.length; index++) {
                                top_country += `\n⚠️ ${res.data.countries[index].c_name}: ${res.data.countries[index].c_cases} ( ${res.data.countries[index].c_deaths})`
                            }
                            response = {
                                "text": `Một số quốc gia khác:\n(Tên - Ca Nhiễm - Số Người Chết)${top_country}`
                            }
                            callSendAPI(sender_psid, response);
                        }, 1600)
                    }
                });
            })
            break;
        default:
            break;
    }
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }
    senderAction(sender_psid, "typing_on");
    setTimeout(() => {
        request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent!')
            } else {
                console.error("Unable to send message:" + err);
            }
        });
        senderAction(sender_psid, "typing_off");
    }, 1000)
}

function senderAction(sender_psid, action) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": action
    }
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    });
}

module.exports = { handleMessage, handlePostback, callSendAPI }