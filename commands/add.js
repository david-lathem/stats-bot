const { CommandType } = require("wokcommands");
const { platformEmojis } = require("../usernameEmoji.json");
const UserGame = require("../models/game_data");

// Command definition

const consoles = ["xbox", "nintendo", "playstation"];
module.exports = {
  description: "Check yours or other person id",
  type: CommandType.SLASH,
  options: [
    // {
    //   name: "user",
    //   description: "user whose data you wanna see",
    //   type: 6,
    //   required: true,
    // },
    {
      name: "type",
      description: "type",
      type: 3,
      choices: Object.keys(platformEmojis).map((e) => ({
        name: e,
        value: e,
      })),
      required: true,
    },
    {
      name: "username",
      description: "username",
      type: 3,

      required: true,
    },
  ],

  callback: async ({ interaction }) => {
    try {
      await interaction.deferReply();

      const type = interaction.options.getString("type");
      const val = interaction.options.getString("username");

      const emoji = platformEmojis[type];

      const t = consoles.includes(type) ? "Console" : "PC";

      const doc = await UserGame.findOneAndUpdate(
        {
          userId: interaction.user.id,
        },
        { userId: interaction.user.id, [`${t}.${emoji}`]: val },
        { new: true, upsert: true }
      );

      //   await doc.updateOne({[`${t}.${}`]});

      await interaction.editReply(`Added ${emoji} ${val}!`);
    } catch (error) {
      console.error(error);
    }
  },
};
