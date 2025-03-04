const { CommandType } = require("wokcommands");
const { createButton, createEmbed } = require("../utils/components");
const { sendMessage } = require("../utils/async");
const {
  createUnixStamp,
  replyInteraction,
  createDoc,
  createLocaleBasedTime,
} = require("../utils/utils");
const social_message = require("../models/social_message");

module.exports = {
  description: "Status Command",
  type: CommandType.SLASH,
  options: [
    {
      name: "social",
      description: "select the social",
      type: 3,
      required: true,
      choices: [
        { name: "Outside", value: "Outside" },
        { name: "Inside", value: "Inside" },
        { name: "Ongoing", value: "Ongoing" },
      ],
    },
    {
      name: "privacy",
      description: "select the privacy",
      type: 3,
      required: true,
      choices: [
        { name: "Private", value: "Private" },
        { name: "Open", value: "Open" },
        { name: "Closed", value: "Closed" },
      ],
    },
    {
      name: "text",
      description: "text",
      type: 3,
      required: true,
    },
    {
      name: "media",
      description: "put any attachment",
      type: 11,
    },
  ],

  callback: async ({ interaction }) => {
    try {
      const { options, user, locale, guild } = interaction;

      const social = options.getString("social");
      const privacy = options.getString("privacy");
      const text = options.getString("text");
      const attachment = options.getAttachment("media");

      replyInteraction(interaction);

      const now = new Date();
      const unixTime = createUnixStamp(now);

      const localeTime = createLocaleBasedTime(now, locale);

      const desc = `${user}\n\nSocial (${social}) [${privacy}]\n\n${text}\n\n${unixTime} [${localeTime}]`;

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
      const row = createButton("forum_social_create");

      const messageData = [guild, embed, row];

      attachment && !isImage && messageData.push(attachUrl);

      const message = await sendMessage(...messageData);

      const data = {
        messageId: message.id,
        username: user.username,
        privacy,
        social,
        text,
      };

      createDoc(social_message, data);
    } catch (error) {
      console.log(error);
    }
  },
};
