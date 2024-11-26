const {
  CONSOLE_IDENTIFIERS,
  PC_IDENTIFIERS,
  platformEmojis,
} = require("./../../usernameEmoji.json");
const UserGame = require("../../models/game_data");
const { extractUsernames } = require("../../utils/activity/regex");

const { PC_IDS_CHANNEL_ID, CONSOLE_USERNAME_CHANNEL_ID } = process.env;

module.exports = async (message) => {
  const {
    channel: { id: chId },
    content,
    author: { id: userId },
  } = message;
  try {
    if (chId !== PC_IDS_CHANNEL_ID && chId !== CONSOLE_USERNAME_CHANNEL_ID)
      return;

    if (message.author.bot) return;

    // const [identifier, id] = content.split("-");
    // const [identifier] = content.split(" ");

    // const emoji = parseEmoji(identifier);

    // if (!id) return;

    // if (!platformEmojis[identifier.toLowerCase().trim()]) return;
    // if (!emoji) return;

    let doc = await UserGame.findOne({ userId });

    if (!doc) doc = await UserGame.create({ userId });

    const type = chId === PC_IDS_CHANNEL_ID ? "PC" : "Console";
    const dataToUpdate = doc[type];

    const { result, emojis } = extractUsernames(content, type);

    if (emojis.length === 0) return;

    await doc.updateOne({
      [type]: {
        ...dataToUpdate,
        ...result,
      },
    });

    const emojiAddPromise = emojis.map((em) => message.react(em));
    await Promise.all(emojiAddPromise);
  } catch (error) {
    console.log(error);
  }
};
