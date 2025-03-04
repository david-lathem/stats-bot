const { channelToSendMessage } = require("../config.json");
const { createButton, createEmbed } = require("./components");
const { createUnixStamp, createLocaleBasedTime } = require("./utils");

function setupGameData(interaction, thread, threadName) {
  const { locale, options, user } = interaction;

  const privacy = options.getString("privacy");
  const platform = options.getString("platform");
  const text = options.getString("text") ?? "";
  const attachment = options.getAttachment("media");


  // Get the current date and time
  const now = new Date();

  // Get the unix timestamp
  const unixStamp = createUnixStamp(now);
  // Format the current time in AM/PM format with the specified locale
  const formattedTime = createLocaleBasedTime(now, locale);

  // create the text

  const desc = `${user}\n\nOnline for Video Games [${privacy}]:\n\n<#${thread}> [${platform}] ${text}\n\n${unixStamp} [${formattedTime}]`;

  let isImage;
  let attachUrl;
  const embedArray = [desc];

  if (attachment) {
    const { contentType, url } = attachment;

    isImage = contentType.split("/")[0] === "image";
    embedArray.push(isImage);
    embedArray.push(url);
    attachUrl = url;
  }
  const embed = createEmbed(...embedArray);

  // create buttons

  const row = createButton("forum_game_create");

  // create the object for monogo data
  const mongoData = {
    threadName,
    privacy,
    text: text || "No Sub Context Given.",
    username: user.username,
  };

  const data = [embed, row, mongoData];

  attachment && !isImage && data.push(attachUrl);

  // return

  return data;
}

async function sendMessage(guild, embed, row, url) {
  const channelToSend = await guild.channels.fetch(channelToSendMessage);

  const data = { embeds: [embed], components: [row] };

  url && (data.files = [url]);

  const message = await channelToSend.send(data);

  await message.react("👀");
  await message.react("✔️");

  return message;
}

module.exports = {
  sendMessage,
  setupGameData,
};
