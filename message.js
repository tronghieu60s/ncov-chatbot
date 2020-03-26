const request = require('request');
const { apiCovid19 } = require('./api/callApi');
const formatDate = require('./formatDate');
const covidModel = require('./models/covid19');
const usersModel = require('./models/users');

function covidAutoUpdate() {
    apiCovid19().then(res => {
        covidModel.findOne({ id: process.env.PAGE_ACCESS_TOKEN }, function (err, covid) {
            let { cases } = covid.data.data.vietnam;
            let date = new Date();
            if (res.data.vietnam.cases != cases) {
                covidModel.findOneAndUpdate({ id: process.env.PAGE_ACCESS_TOKEN }, { data: res, date }, () => { });
                usersModel.find({}, function (err, users) {
                    let response;
                    for (const user of users) {
                        response = {
                            "text": `⚠️⚠️⚠️ THÔNG BÁO TÌNH HÌNH DỊCH VIÊM PHỔI CẤP DO CHỦNG MỚI CỦA VIRUS CORONA 🦠🦠🦠\n➖ Số người nhiễm: ${res.data.global.cases}\n➖ Tử vong: ${res.data.global.deaths}\n➖ Bình phục: ${res.data.global.recovered}`
                        }
                        callSendAPI(user.sender_psid, response);

                        setTimeout(function () {
                            response = {
                                "text": `Số ca mắc COVID-19 tại Việt Nam có chiều hướng gia tăng: \n⚠️ Số người nhiễm: ${res.data.vietnam.cases}\n☠️ Tử vong: ${res.data.vietnam.deaths}\n🍀 Bình phục: ${res.data.vietnam.recovered}\n\n⏱ Cập nhật lúc : ${formatDate(date)}\n☑️ Dữ liệu được cập nhật mỗi 5 phút.`
                            }
                            callSendAPI(user.sender_psid, response);
                        }, 800)

                        setTimeout(function () {
                            let { tableCases } = res.data.vietnam;
                            let sliceCases = `BN${cases}`;
                            let newInfection = tableCases.slice(0, tableCases.indexOf(sliceCases) - 3);
                            response = {
                                "text": `Số ca mắc COVID-19 tại Việt Nam hiện nay gồm có (xếp theo ca bệnh mới nhất):\n${newInfection}`
                            }
                            callSendAPI(user.sender_psid, response);
                        }, 1600)
                    }
                })
            }
        })
    })
}

function handleMessage(sender_psid, received_message) {
    usersModel.findOne({ sender_psid }, function (err, user) {
        if (!user) usersModel.create({ sender_psid }, () => { })
    })
    let response;
    if (received_message.text) {
        let infector = parseInt(received_message.text);
        apiCovid19().then(res => {
            if (!isNaN(infector)) {
                let { cases, tableCases } = res.data.vietnam;
                let findCase = `BN${infector - 1}:`
                let sliceCases = `BN${infector}:`;
                let showInfection = tableCases.slice(tableCases.indexOf(sliceCases) - 3, tableCases.indexOf(findCase) - 3);
                if(infector <= 16){
                    response = {
                        "text": `16 người mắc COVID-19 tính từ ngày 23/1 đến ngày 13/2 đã được chữa khỏi bệnh hoàn toàn (giai đoạn 1).\nThông tin chỉ cập nhật số bệnh nhân trong giao đoạn 2.`
                    }
                } else if(infector > cases){
                    response = {
                        "text": `Hiện tại chỉ có ${cases} bệnh nhân đã được chuẩn đoán mắc Covid-19.`
                    }
                }else {
                    response = {
                        "text": `${showInfection}`
                    }
                }
            } else {
                response = {
                    "text": `Lỗi cú pháp, vui lòng thử lại!`
                }
            }
            callSendAPI(sender_psid, response);
        })
    }
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
                                "text": `Số ca mắc COVID-19 tại Việt Nam có chiều hướng gia tăng: \n⚠️ Số người nhiễm: ${res.data.vietnam.cases}\n☠️ Tử vong: ${res.data.vietnam.deaths}\n🍀 Bình phục: ${res.data.vietnam.recovered}\n\n⏱ Cập nhật lúc : ${formatDate(date)}\n☑️ Dữ liệu được cập nhật mỗi 5 phút.`
                            }
                            callSendAPI(sender_psid, response);
                        }, 800)
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

module.exports = { handleMessage, handlePostback, covidAutoUpdate }