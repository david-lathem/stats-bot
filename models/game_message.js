const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, required: true },
  username: String,
  threadName: String,
  privacy: String,
  text: String,
});

module.exports = mongoose.model("gameData", messageSchema);
