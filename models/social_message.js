const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, required: true },
  username: String,
  social: String,
  privacy: String,
  text: String,
});

module.exports = mongoose.model("socialData", messageSchema);
