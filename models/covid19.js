const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const COVID19 = new Schema({
  id: String,
  data: Object,
  date: { type: Date, default: Date.now }
}, { collection: 'COVID-19' });
const MyModel = mongoose.model('COVID-19', COVID19);

module.exports = MyModel;