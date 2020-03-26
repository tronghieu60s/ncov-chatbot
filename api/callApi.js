const axios = require('axios').default;

function apiCovid19() {
    return axios.get('https://ncov-crawler-api.herokuapp.com/api')
        .then(response => response.data)
        .catch(function (error) {
            console.log(error);
        })
}

module.exports = { apiCovid19 }