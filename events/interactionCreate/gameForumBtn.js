const { forumChannelId } = require("../../config.json");
const gameMsgSchema = require("../../models/game_message");
const social_message = require("../../models/social_message");

module.exports = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const { customId, guild, message: interactionMessage } = interaction;

    const [isValid, type] = customId.split("_");

    if (isValid !== "forum") return;

    await interaction.update({ components: [] });

    const { embeds, id: messageId } = interactionMessage;

    const channel = await guild.channels.fetch(forumChannelId);

    // get from database the variables

    const schema = type === "game" ? gameMsgSchema : social_message;

    const doc = await schema.findOne({ messageId });

    if (!doc) {
      await interaction.followUp({
        content: "No data found about this message",
        ephemeral: true,
      });
      return;
    }

    let forumObj;

    if (type === "game") {
      const { threadName, privacy, username } = doc;

      forumObj = {
        name: `${username} - ${threadName} [${privacy}]`,
      };
    }

    if (type === "social") {
      const { privacy, social, username } = doc;

      forumObj = {
        name: `${username} - ${social} [${privacy}]`,
      };
    }

    forumObj.message = { content: doc.text };

    const thread = await channel.threads.create(forumObj);

    embeds[0].data.description += `\n\n[Forum Link](${thread.url})`;

    await interactionMessage.edit({
      embeds,
    });

    await doc.deleteOne().catch((e) => console.log(e));
  } catch (error) {
    console.log(error);
  }
};
