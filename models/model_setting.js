// model_settings.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SettingsSchema = new Schema({
  max_hashtag_limit: { type: Number, default: 5 }
});
const Settings = mongoose.model('settings', SettingsSchema);
module.exports = Settings;