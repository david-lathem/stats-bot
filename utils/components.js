const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const generateGeneralEmbed = function ({
  title,
  url,
  description,
  fields,
  thumbnail,
  image,
  footer,
}) {
  const embed = new EmbedBuilder().setColor(0x000000);

  title && embed.setTitle(title);
  url && embed.setURL(url);
  description && embed.setDescription(description);
  thumbnail && embed.setThumbnail(thumbnail);
  fields && embed.addFields(...fields);
  footer && embed.setFooter(footer);
  image && embed.setImage(image);
  return embed;
};

function createButton(customId) {
  const confirm = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel("Create Forum")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(confirm);
  return row;
}

function createEmbed(desc, isImage, url) {
  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setDescription(desc);

  isImage && exampleEmbed.setImage(url);

  return exampleEmbed;
}

module.exports = {
  createButton,
  generateGeneralEmbed,
  createEmbed,
};
