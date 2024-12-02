const Fuse = require("fuse.js");
const mongoose = require("mongoose");
const UserGame = require("../../models/game_data");

// const { platformEmojis } = require("./../../usernameEmoji.json");

// const friendCodePlatforms = ["Window", "PC", "MacOS", "Linux"];
// const userSteamData = {};

async function getSteamAppList() {
  const response = await fetch(
    "http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json"
  );
  const data = await response.json();
  return data.applist.apps;
}
// async function getSteamInfoFromChannels(userId, client) {
//   // const isFriendCode = friendCodePlatforms.includes(platform);

//   // console.log(isFriendCode);

//   // const chId = isFriendCode
//   //   ? process.env.FRIEND_CODE_CHANNEL_ID
//   //   : process.env.CONSOLE_USERNAME_CHANNEL_ID;

//   if (userSteamData[userId]?.steam && userSteamData[userId]?.PS)
//     return userSteamData[userId].steam + " | " + userSteamData[userId].PS;

//   const chIds = [
//     process.env.FRIEND_CODE_CHANNEL_ID,
//     process.env.CONSOLE_USERNAME_CHANNEL_ID,
//   ];

//   userSteamData[userId] = {};

//   for (const chId of chIds) {
//     const ch = client.channels.cache.get(chId);

//     if (!ch) throw new Error("Steam info channel not found");

//     let found;

//     let lastMessageId;

//     while (found?.author?.id !== userId) {
//       const msgs = await ch.messages.fetch({
//         limit: 100,
//         ...(lastMessageId && { before: lastMessageId }),
//       });

//       const isFound = msgs.find((m) => m.author.id === userId);

//       if (isFound) found = isFound;

//       if (!isFound && msgs.size === 0) break;
//       if (!isFound) lastMessageId = msgs.last()?.id;
//     }

//     if (!found) continue;

//     if (chId === process.env.FRIEND_CODE_CHANNEL_ID)
//       userSteamData[
//         userId
//       ].steam = `<:steam41:1266450026050093166> \`${found.content.trim()}\``;

//     if (chId !== process.env.FRIEND_CODE_CHANNEL_ID) {
//       const [console, ...content] = found.content.split("-");

//       const emoji =
//         console.toLowerCase().trim() === "xbox"
//           ? "<:Xbox:1252767852105170965> "
//           : "<:PlayStation:1252767850343436372>";

//       userSteamData[userId].PS = `${emoji} \`${content.join("").trim()}\``;
//     }
//   }

//   return `${
//     userSteamData[userId]?.steam ||
//     `<:steam41:1266450026050093166> \`Not found\``
//   } | ${
//     userSteamData[userId]?.PS ||
//     `<:PlayStation:1252767850343436372> \`Not found\``
//   }`;
// }
function findMostRelevantGames(input, games, limit = 25) {
  const options = {
    keys: ["name"],
    includeScore: true,
    threshold: 0.4,
  };

  const fuse = new Fuse(games, options);
  return fuse.search(input, { limit });
}

async function getSteamGameDetails(appId) {
  const response = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appId}`
  );
  const data = await response.json();

  console.log(data);

  return data[appId]?.data;
}

function generateEmojisData(obj) {
  return Object.entries(obj).reduce((acc, [emoji, id]) => {
    acc += `### ${emoji} \`${id}\`\n`;
    return acc;
  }, "\n");
}

async function upsertUserGame(userId, newGameData) {
  try {
    let userGame = await UserGame.findOne({ userId });

    if (userGame) {
      const index = userGame.gameData.findIndex(
        (game) => game.appId === newGameData.appId
      );

      if (index === -1) {
        userGame.gameData.push(newGameData);
        await userGame.save();
        console.log(`Added new game data for userId: ${userId}`);
      } else {
        userGame.gameData[index].timesUsed++;
        await userGame.save();

        console.log(
          `AppId: ${newGameData.appId} already exists for userId: ${userId}`
        );
      }
    } else {
      userGame = new UserGame({
        userId,
        gameData: [newGameData],
      });
      await userGame.save();
      console.log(
        `Created new document and added game data for userId: ${userId}`
      );
    }

    return userGame;
  } catch (error) {
    console.error("Error upserting user game data:", error);
  }
}

module.exports = {
  getSteamAppList,
  findMostRelevantGames,
  getSteamGameDetails,
  upsertUserGame,
  generateEmojisData,
};
