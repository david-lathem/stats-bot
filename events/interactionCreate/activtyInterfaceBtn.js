const locationTimezone = require("node-location-timezone");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  InteractionType,
  ChannelType,
  WebhookClient,
  MessageFlags,
} = require("discord.js");

const UserGame = require("../../models/game_data");

const { platformEmojis, forumChannelId } = require("../../config.json");
const {
  platformEmojis: messagePlatformEmojis,
} = require("../../usernameEmoji.json");
const globalConfig = {};
const globalAppId = {};
const tags = {
  MacOS: "Mac",
  PlayStation: "PlayStation",
  PSP: "PlayStation",
  Xbox: "Xbox",
  Nintendo: "Nintendo",
  Wii: "Nintendo",
  // Oculus: "Nintendo",
};

const PC_PLATFORMS = ["Windows", "PC", "Linux", "MacOS"];

let gamesCached;

const {
  getSteamAppList,
  findMostRelevantGames,
  getSteamGameDetails,
  upsertUserGame,
  generateEmojisData,
} = require("../../utils/activity/Steam.service");
module.exports = async (interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId !== "open_game_search_modal") return;
      const userId = interaction.user.id;

      // const userGame = await UserGame.findOne({ userId });

      // if (userGame?.gameData?.length > 0) {
      //   let sortedTop24 = userGame.gameData
      //     .sort((a, b) => b.timesUsed - a.timesUsed)
      //     .slice(0, 24);

      //   const options = sortedTop24.map((game, index) =>
      //     new StringSelectMenuOptionBuilder()
      //       .setLabel(`${index + 1}. ${game.gameName.substring(0, 100)}`)
      //       .setDescription("Played " + game.timesUsed + " time(s)")
      //       .setValue(
      //         `${game.appId.toString()}-${game.gameName.substring(0, 80)}`
      //       )
      //   );

      //   options.unshift(
      //     new StringSelectMenuOptionBuilder()
      //       .setLabel(`Search for custom game`)
      //       .setDescription("If you wanna search for another game")
      //       .setValue("search")
      //   );

      //   const embed = new EmbedBuilder()
      //     .setTitle("Select a Game")
      //     .setColor("#0099ff")
      //     .setDescription("Please select a game from the dropdown menu below.");
      //   const select = new StringSelectMenuBuilder()
      //     .setCustomId("select_database_game")
      //     .setPlaceholder("Select a game")
      //     .addOptions(options.slice(0, 25));

      //   const row = new ActionRowBuilder().addComponents(select);

      //   await interaction.reply({
      //     embeds: [embed],
      //     components: [row],
      //     ephemeral: true,
      //   });
      // } else {
      const modal = new ModalBuilder()
        .setCustomId("gameDetails")
        .setTitle("Search for a Game");

      const gameInput = new TextInputBuilder()
        .setCustomId("gameInput")
        .setLabel("Enter a game name to search")
        .setStyle(TextInputStyle.Short);

      const titleInput = new TextInputBuilder()
        .setCustomId("titleInput")
        .setLabel("Enter the title of post")
        .setStyle(TextInputStyle.Short);

      const descriptionInput = new TextInputBuilder()
        .setCustomId("descriptionInput")
        .setLabel("Enter a Description")
        .setStyle(TextInputStyle.Paragraph);
      const firstActionRow = new ActionRowBuilder().addComponents(gameInput);
      const secondActionRow = new ActionRowBuilder().addComponents(
        descriptionInput
      );
      const thirdActionRow = new ActionRowBuilder().addComponents(titleInput);

      modal.addComponents(firstActionRow, thirdActionRow, secondActionRow);

      await interaction.showModal(modal);
      // }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      const {
        user: { id: userId },
        customId,
        fields,
      } = interaction;

      const parts = customId.split("_");

      if (parts[0] !== "gameDetails") return;

      await interaction.deferReply({ ephemeral: true });

      const gameInput = fields.fields.get("gameInput")?.value;
      // ||
      // globalAppId[interaction.user.id];

      const description = fields.getTextInputValue("descriptionInput");

      const title = fields.getTextInputValue("titleInput");

      globalConfig[userId] = {
        title,
        description,
        // id: gameInput.split("-")[0],
        name: gameInput,
        // name: gameInput.split("-")[1],
      };

      // console.log(globalConfig);

      // if (parts[1] === "selectedGame") {
      //   const sortedPlatforms = await UserGame.getSortedPlatforms(id);

      //   const platformSelect = new StringSelectMenuBuilder()
      //     .setCustomId("select_platform")
      //     .setPlaceholder("Select a platform")
      //     .addOptions(
      //       sortedPlatforms.map((platform) => ({
      //         label: platform.name ?? platform,
      //         description: `Selected ${platform.timeUsed ?? 0} time(s)`,
      //         value: platform.name ?? platform,
      //       }))
      //     );

      //   const row = new ActionRowBuilder().addComponents(platformSelect);

      //   return interaction.editReply({
      //     components: [row],
      //   });
      // const privacySelect = new StringSelectMenuBuilder()
      //   .setCustomId("select_privacy")
      //   .setPlaceholder("Select privacy setting")
      //   .addOptions([
      //     {
      //       label: "Private",
      //       value: "Private",
      //     },
      //     {
      //       label: "Open",
      //       value: "Open",
      //     },
      //   ]);
      // const embed = new EmbedBuilder()
      //   .setTitle(`Select Modes`)
      //   .setColor("#0099ff")
      //   .setDescription("Please select a mode from the dropdown menu below.");
      // const row = new ActionRowBuilder().addComponents(privacySelect);
      // return await interaction.editReply({
      //   embeds: [embed],
      //   components: [row],
      // });
      // }

      // if (!gamesCached) gamesCached = await getSteamAppList();

      // const results = findMostRelevantGames(gameInput, gamesCached, 100);

      // console.log(results);

      // globalConfig[id].id = results[0]?.item?.appid;
      // globalConfig[id].name = results[0]?.item?.name;

      const sortedPlatforms = await UserGame.getSortedPlatforms(userId);

      const platformSelect = new StringSelectMenuBuilder()
        .setCustomId("select_platform")
        .setPlaceholder("Select a platform")
        .addOptions(
          sortedPlatforms.map((platform) => ({
            label: platform.name ?? platform,
            description: `Selected ${platform.timeUsed ?? 0} time(s)`,
            value: platform.name ?? platform,
          }))
        );

      const row = new ActionRowBuilder().addComponents(platformSelect);

      // const updatedEmbed = EmbedBuilder.from(
      //   interaction.message.embeds[0]
      // ).addFields({
      //   name: "Privacy Setting",
      //   value:
      //     selectedPrivacy.charAt(0).toUpperCase() + selectedPrivacy.slice(1),
      // });

      await interaction.editReply({
        // embeds: [updatedEmbed],
        components: [row],
      });
      // const uniqueGamesMap = new Map();

      // results.forEach((result) => {
      //   const existingGame = uniqueGamesMap.get(result.item.appid);
      //   if (!existingGame || result.score > existingGame.score) {
      //     uniqueGamesMap.set(result.item.appid, result);
      //   }
      // });

      // const uniqueResults = Array.from(uniqueGamesMap.values()).sort(
      //   (a, b) => b.score - a.score
      // );

      // const embed = new EmbedBuilder()
      //   .setTitle(`Search Results for "${gameInput}"`)
      //   .setColor("#0099ff")
      //   .setDescription("Please select a game from the dropdown menu below.");

      // const select = new StringSelectMenuBuilder()
      //   .setCustomId("select_game")
      //   .setPlaceholder("Select a game")
      //   .addOptions(
      //     uniqueResults.slice(0, 25).map((result, index) =>
      //       new StringSelectMenuOptionBuilder()
      //         .setLabel(`${index + 1}. ${result.item.name.substring(0, 100)}`)
      //         .setDescription(`Score: ${result.score.toFixed(2)}`)
      //         .setValue(result.item.appid.toString())
      //     )
      //   );
      // const row = new ActionRowBuilder().addComponents(select);

      // await interaction.editReply({
      //   embeds: [embed],
      //   components: [row],
      //   ephemeral: true,
      // });
    } else if (interaction.isStringSelectMenu()) {
      // if (interaction.customId === "select_game") {
      //   const selectedGameId = interaction.values[0];
      //   if (!globalConfig.hasOwnProperty(interaction.user.id))
      //     return await interaction.update({
      //       content: "Something went wrong, please try again later",
      //       components: [],
      //       ephemeral: true,
      //     });

      //   globalConfig[interaction.user.id].id = selectedGameId;

      //   const privacySelect = new StringSelectMenuBuilder()
      //     .setCustomId("select_privacy")
      //     .setPlaceholder("Select privacy setting")
      //     .addOptions([
      //       {
      //         label: "Private",
      //         value: "Private",
      //       },
      //       {
      //         label: "Open",
      //         value: "Open",
      //       },
      //     ]);

      //   const embed = new EmbedBuilder()
      //     .setTitle(`Select Modes`)
      //     .setColor("#0099ff")
      //     .setDescription("Please select a mode from the dropdown menu below.");

      //   const row = new ActionRowBuilder().addComponents(privacySelect);

      //   await interaction.update({
      //     embeds: [embed],
      //     components: [row],
      //   });
      // }

      // if (interaction.customId === "select_platform") {
      //   const selectedPlatform = interaction.values[0];
      //   if (!globalConfig.hasOwnProperty(interaction.user.id))
      //     return await interaction.update({
      //       content: "Something went wrong, please try again later",
      //       components: [],
      //       ephemeral: true,
      //     });

      //   globalConfig[interaction.user.id].privacy = selectedPlatform;
      // }
      // else
      if (interaction.customId === "select_platform") {
        const selectedPlatform = interaction.values[0];
        if (!globalConfig.hasOwnProperty(interaction.user.id)) {
          await interaction.update({
            content: "Something went wrong, please try again later",
            components: [],
            ephemeral: true,
          });
          return;
        }

        await interaction.deferUpdate();

        globalConfig[interaction.user.id].platform = selectedPlatform;

        // let gameInfo = await getSteamGameDetails(
        //   globalConfig[interaction.user.id].id
        // );

        // if (!gameInfo) throw new Error("Game not found");

        const forumChannel =
          interaction.client.channels.cache.get(forumChannelId);

        if (!forumChannel || forumChannel.type !== ChannelType.GuildForum) {
          await interaction.update({
            content:
              "Unable to create forum thread. Please contact an administrator.",
            ephemeral: true,
            components: [],
          });
          return;
        }

        const { roles } = interaction.member;

        const countryName =
          roles.highest.name === "United Kingdom"
            ? "The United Kingdom of Great Britain and Northern Ireland"
            : roles.highest.name;

        const country = locationTimezone.findCountryByName(countryName);

        // console.log(country);

        const curDate = new Date();

        const memberLocalTime = curDate.toLocaleTimeString([], {
          timeZone: country?.timezones[0],
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        const timestampStr = `<t:${Math.floor(
          curDate / 1000
        )}:t> | <t:${Math.floor(curDate / 1000)}:R> | ${memberLocalTime}`;

        const userConfig = globalConfig[interaction.user.id];

        console.log(userConfig);

        const threadName = userConfig.title;

        // const code = await getSteamInfoFromChannels(
        //   // userConfig.platform,
        //   interaction.user.id,
        //   interaction.client
        // );

        // const gameData = {
        //   appId: globalConfig[interaction.user.id].id,
        //   gameName: globalConfig[interaction.user.id].name,
        // };

        // await upsertUserGame(interaction.user.id, gameData);

        const doc = await UserGame.incrementPlatformUsage(
          interaction.user.id,
          userConfig.platform
        );

        let platformTypeEmojis = {};

        const isPCPlatform = PC_PLATFORMS.includes(userConfig.platform);

        // console.log(isPCPlatform);
        // console.log(
        //   !isPCPlatform &&
        //     userConfig.platform !== "iOS" &&
        //     userConfig.platform !== "Android"
        // );

        let p;

        if (isPCPlatform) {
          platformTypeEmojis = doc.PC;
          p = "PC";
        }

        if (
          !isPCPlatform &&
          userConfig.platform !== "iOS" &&
          userConfig.platform !== "Android"
        ) {
          const tag = tags[userConfig.platform.split(" ")[0]];
          p = tag;

          if (tag) {
            const em = messagePlatformEmojis[tag.toLowerCase()];

            platformTypeEmojis = { [em]: doc.Console[em] };
          }
        }

        // console.log(doc);

        const emojisData = generateEmojisData(platformTypeEmojis) || "\n";

        const res = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${
            process.env.GOOGLE_API_KEY
          }&cx=${process.env.SEARCH_ENGINE_ID}&q=${userConfig.name} ${p ?? "PC"}`
        );

        const { items } = await res.json();
        // console.log(emojisData);

        console.log(items);

        const threadContent = `## ${userConfig.description}\n\n* [**${
          userConfig.name
        }**](${
          // userConfig
          items[0].link
        })${
          interaction.member.voice.channel
            ? `\n  * ${interaction.member.voice.channel}`
            : ""
        }\n# ${
          platformEmojis[userConfig.platform]
        }${emojisData}\n${timestampStr}`;

        const tagStr =
          tags[userConfig.platform.split(" ")[0]] ?? userConfig.platform;

        let tag = forumChannel.availableTags.find(
          (t) => t.name.toLowerCase() === tagStr.toLowerCase()
        );

        if (!tag) tag = forumChannel.availableTags.find((t) => t.name === "PC");

        const webhook = new WebhookClient({
          url: process.env.webhookUrl,
        });

        const thread = await webhook.send({
          threadName,
          content: threadContent,
          // files: [
          //   `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameData.appId}/header.jpg`,
          // ],
          appliedTags: [
            tag.id,
            // "1263088010032054292",
            // "1263088134435110983",
            // "1263091335334985849",
            // "1263108433796927538",
            // "1263118765101551646",
            // "1263120760008867920",
            // "1263121263497314395",
            // "1263124882485547039",
          ],
          flags: MessageFlags.SuppressEmbeds,
          username: interaction.member.displayName,
          avatarURL: interaction.member.displayAvatarURL(),
        });

        await interaction.editReply({
          content: `Here you go https://discord.com/channels/${process.env.GUILD_ID}/${thread.id}`,
          ephemeral: true,
          components: [],
        });
      } else if (interaction.customId === "select_database_game") {
        console.log("database games selected");

        if (interaction.values[0] === "search") {
          const modal = new ModalBuilder()
            .setCustomId("gameDetails")
            .setTitle("Search for a Steam Game");

          const gameInput = new TextInputBuilder()
            .setCustomId("gameInput")
            .setLabel("Enter a game name to search")
            .setStyle(TextInputStyle.Short);

          const titleInput = new TextInputBuilder()
            .setCustomId("titleInput")
            .setLabel("Enter a title of the post")
            .setStyle(TextInputStyle.Short);

          const descriptionInput = new TextInputBuilder()
            .setCustomId("descriptionInput")
            .setLabel("Enter a Description")
            .setStyle(TextInputStyle.Paragraph);
          const firstActionRow = new ActionRowBuilder().addComponents(
            gameInput
          );
          const secondActionRow = new ActionRowBuilder().addComponents(
            descriptionInput
          );
          const thirdActionRow = new ActionRowBuilder().addComponents(
            titleInput
          );

          modal.addComponents(firstActionRow, thirdActionRow, secondActionRow);

          return await interaction.showModal(modal);
        }
        globalAppId[interaction.user.id] = interaction.values[0];
        console.log(globalAppId);
        const modal = new ModalBuilder()
          .setCustomId("gameDetails_selectedGame")
          .setTitle("Search for a Steam Game");

        const titleInput = new TextInputBuilder()
          .setCustomId("titleInput")
          .setLabel("Entr the title for the Post")
          .setStyle(TextInputStyle.Short);

        const descriptionInput = new TextInputBuilder()
          .setCustomId("descriptionInput")
          .setLabel("Enter a Description")
          .setStyle(TextInputStyle.Paragraph);
        const secondActionRow = new ActionRowBuilder().addComponents(
          descriptionInput
        );
        const thirdActionRow = new ActionRowBuilder().addComponents(titleInput);
        modal.addComponents(thirdActionRow, secondActionRow);

        await interaction.showModal(modal);
      }
    }
  } catch (error) {
    console.error(error);
    console.error(error.requestBody);
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: error.message,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: error.message,
          ephemeral: true,
        });
      }
    } catch (error) {}
  }
};
