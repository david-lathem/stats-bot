const { CommandType } = require("wokcommands");
const { EmbedBuilder, WebhookClient } = require("discord.js");
const UserGame = require("../models/game_data");
const { generateEmojisData } = require("../utils/activity/Steam.service");

// Command definition
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
      name: "platform",
      description: "platform",
      type: 3,
      choices: [
        { name: "PC", value: "PC" },
        { name: "Console", value: "Console" },
      ],
    },
  ],

  callback: async ({ interaction }) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const user = interaction.member;
      const doc = await UserGame.findOne({
        userId: user.id,
      });

      const platform = interaction.options.getString("platform");

      let str;

      if (doc)
        str = `${
          platform
            ? generateEmojisData(doc[platform]) || "\u200B"
            : `${generateEmojisData(doc.PC)} ${generateEmojisData(
                doc.Console
              )}` || "\u200B"
        }`;

      if (!doc) str = "\u200B";

      const embed = new EmbedBuilder()
        .setTitle("Data")
        .setDescription(str)
        .setColor("#0099ff");

      await interaction.deleteReply();

      // await interaction.editReply(str);

      let webhooks = await interaction.channel.fetchWebhooks();
      let webhook = webhooks.find((wh) => wh.token);

      // If no webhook exists, create a new one
      if (!webhook) {
        webhook = await interaction.channel.createWebhook({
          name: "Message Relay Webhook",
          avatar: interaction.client.user.displayAvatarURL(),
        });
      }

      // Send the message through the webhook in the same channel
      await webhook.send({
        content: str,
        username: user.displayName,
        avatarURL: user.displayAvatarURL(),
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "An error occurred while executing this command.",
        ephemeral: true,
      });
    }
  },
};
