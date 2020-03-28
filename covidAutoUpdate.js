const { apiCovid19 } = require('./api/callApi');
const formatDate = require('./formatDate');
const covidModel = require('./models/covid19');
const usersModel = require('./models/users');
const { callSendAPI } = require('./message');

module.exports = function covidAutoUpdate() {
    apiCovid19().then(res => {
        covidModel.findOne({ id: process.env.PAGE_ACCESS_TOKEN }, function (err, covid) {
            let { cases } = covid.data.data.vietnam;
            let date = new Date();
            if (parseInt(res.data.vietnam.cases) > parseInt(cases)) {
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
                    }
                })
            }
        })
    })
}