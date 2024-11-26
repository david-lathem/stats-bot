const mongoose = require("mongoose");
const { Schema } = mongoose;

const config = require("../config.json");
const platformUsageSchema = new Schema(
  {
    name: {
      type: String,
      enum: config.platforms,
      required: true,
    },
    timeUsed: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);
const gameDataSchema = new Schema(
  {
    appId: {
      type: String,
      required: true,
    },
    timesUsed: {
      type: Number,
      default: 1,
    },

    gameName: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const userGameSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    PC: { type: Object, default: {} },
    Console: { type: Object, default: {} },
    gameData: {
      type: [gameDataSchema],
      required: true,
      default: [],
    },
    platforms: {
      type: [platformUsageSchema],
      default: config.platforms.map((platform) => ({
        name: platform,
        timeUsed: 0,
      })),
    },
  },
  { timestamps: true }
);

userGameSchema.statics.incrementPlatformUsage = async function (
  userId,
  selectedPlatform
) {
  const doc = await this.findOneAndUpdate(
    { userId },
    { userId },
    { upsert: true, new: true }
  );

  const result = await this.findOneAndUpdate(
    {
      userId: userId,
      "platforms.name": selectedPlatform,
    },
    {
      $inc: { "platforms.$.timeUsed": 1 },
    },
    {
      // upsert: true,
      new: true,
      // setDefaultsOnInsert: true,
    }
  );

  return result;
};

userGameSchema.statics.getSortedPlatforms = async function (userId) {
  const userGame = await this.findOne({ userId: userId });

  // console.log(config.platforms);

  if (!userGame) return config.platforms;

  // Sort the platforms array based on timeUsed in descending order
  const sortedPlatforms = userGame.platforms.sort(
    (a, b) => b.timeUsed - a.timeUsed
  );

  return sortedPlatforms;
};

const UserGame = mongoose.model("UserGame", userGameSchema);

module.exports = UserGame;
