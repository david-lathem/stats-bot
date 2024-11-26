const { CommandType } = require("wokcommands");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  InteractionType,
} = require("discord.js");
const Fuse = require("fuse.js");

// Command definition
module.exports = {
  description: "Search for Steam games",
  type: CommandType.SLASH,
  // options: [
  //   {
  //     name: "channel",
  //     description: "Select the channel to send the search interface",
  //     type: 7,
  //     required: true,
  //   },
  // ],

  callback: async ({ interaction }) => {
    try {
      const targetChannel = interaction.channel;
      if (!targetChannel.isTextBased()) {
        return interaction.reply({
          content: "Please select a text channel.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("**Start** __here__")

        .setColor("#0099ff");

      const button = new ButtonBuilder()
        .setCustomId("open_game_search_modal")
        .setLabel("Create")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const m = await targetChannel.send({
        // embeds: [embed],
        content: "\u200B",
        components: [row],
      });

      await interaction.reply({
        content: `Search interface sent successfully to ${targetChannel}!`,
        ephemeral: true,
      });

      console.log(m.components[0].components);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while executing this command.",
        ephemeral: true,
      });
    }
  },
};
