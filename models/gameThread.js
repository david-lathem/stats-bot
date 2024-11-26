// const { Schema, model } = require("mongoose");

// const schema = new Schema(
//   {
//     gameName: { type: String, required: true, unique: true },
//     activitiesPlayed: { type: Number, default: 1 },
//     threadId: { type: String, required: true, unique: true },
//   },
//   { timestamps: true }
// );

// module.exports = model("gamethreads", schema);
const mongoose = require("mongoose");

const gameThreadSchema = new mongoose.Schema(
  {
    gameName: { type: String, required: true, unique: true },
    threadId: { type: String, required: true },
    userPlays: [
      {
        userId: { type: String, required: true },
        plays: { type: Number, default: 0 },
      },
    ],
    totalPlays: { type: Number, default: 0 },
    lastThreshold: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("gameThread", gameThreadSchema);
