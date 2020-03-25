const axios = require('axios').default;

function apiCovid19() {
    return axios.get('https://code.junookyo.xyz/api/ncov-moh/data.json')
        .then(response => response.data)
        .catch(function (error) {
            console.log(error);
        })
}

module.exports = { apiCovid19 }