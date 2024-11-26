const { platformEmojis } = require("./../../usernameEmoji.json");
const PCregex = /\b(Steam|Battle\.net|Ubisoft|EA|Epic Games)\s*-\s*([^\s,]+)/gi;

const Consoleregex = /\b(PlayStation|Xbox|Nintendo)\s*-\s*([^\s,]+)/gi;

const extractUsernames = function (message, type) {
  let matches;

  const result = {};
  const emojis = [];
  const regexToWork = type === "PC" ? PCregex : Consoleregex;

  while ((matches = regexToWork.exec(message)) !== null) {
    const [_, platform, username] = matches;
    const platformKey = platform.toLowerCase();

    if (platformEmojis[platformKey]) {
      result[platformEmojis[platformKey]] = username;
      emojis.push(platformEmojis[platformKey]);
    }
  }

  return { result, emojis };
};

module.exports = { extractUsernames };
