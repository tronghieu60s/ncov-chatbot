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
            let increase = parseInt(res.data.vietnam.cases) - parseInt(cases);
            if (parseInt(res.data.vietnam.cases) > parseInt(cases)) {
                covidModel.findOneAndUpdate({ id: process.env.PAGE_ACCESS_TOKEN }, { data: res, date }, () => { });
                usersModel.find({}, function (err, users) {
                    let response;
                    for (const user of users) {
                        response = {
                            "text": `⚠️⚠️⚠️ Số ca mắc COVID-19 tại Việt Nam có chiều hướng gia tăng: \n⚠️ Nhiễm bệnh: ${res.data.vietnam.cases} (Tăng ${increase} ca)\n☠️ Tử vong: ${res.data.vietnam.deaths}\n🍀 Bình phục: ${res.data.vietnam.recovered}\n\n⏱ Cập nhật lúc : ${formatDate(date)}\n☑️ Dữ liệu được cập nhật mỗi 5 phút.`
                        }
                        callSendAPI(user.sender_psid, response);
                        setTimeout(function () {
                            let top_country = "";
                            for (let index = 0; index < res.data.countries.length; index++) {
                                top_country += `\n⚠️ ${res.data.countries[index].c_name}: (${res.data.countries[index].c_cases} - ${res.data.countries[index].c_deaths})`
                            }
                            response = {
                                "text": `Một số quốc gia khác:\n(Tên - Ca Nhiễm - Số Người Chết):${top_country}`
                            }
                            callSendAPI(user.sender_psid, response);
                        }, 1600)
                    }
                })
            }
        })
    })
}