const { channelToSendMessage } = require("../config.json");

const createUnixStamp = (now) => `<t:${Math.floor(now.getTime() / 1000)}:f>`;

const createDoc = async (schema, obj) => await schema.create(obj);

const findDoc = async (schema, messageId) =>
  await schema.findOne({ messageId });

function createLocaleBasedTime(now, locale) {
  const formattedDate = now.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return formattedDate;
}

async function replyInteraction(interaction) {
  await interaction.reply({
    content: `Success! <#${channelToSendMessage}>.`,
    ephemeral: true,
  });
}

module.exports = {
  replyInteraction,
  createUnixStamp,
  createDoc,
  findDoc,
  createLocaleBasedTime,
};
