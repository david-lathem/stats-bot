const { Client, IntentsBitField, Partials, Collection } = require("discord.js");
const WOK = require("wokcommands");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const path = require("path");
const UserGame = require("./models/game_data");
const { extractUsernames } = require("./utils/activity/regex");

const { DefaultCommands } = WOK;
const { TOKEN, MONGO_URI, CONSOLE_USERNAME_CHANNEL_ID, PC_IDS_CHANNEL_ID } =
  process.env;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildPresences,
  ],
  partials: [Partials.Channel, Partials.User],
});

client.on("ready", async () => {
  console.log(`${client.user.username} is running`);
  await mongoose.connect(MONGO_URI);

  const chIdArr = [PC_IDS_CHANNEL_ID, CONSOLE_USERNAME_CHANNEL_ID];

  for (const chId of chIdArr) {
    const ch = client.channels.cache.get(chId);
    const type = chId === PC_IDS_CHANNEL_ID ? "PC" : "Console";

    let messages = new Collection();

    console.log("looping over channel");

    let lastMessageId;

    do {
      console.log("doing");

      try {
        messages = await ch.messages.fetch({
          limit: 100,
          ...(lastMessageId && { before: lastMessageId }),
        });

        await Promise.all(
          messages.map(async (m) => {
            const {
              author: { id, bot },
              content,
            } = m;

            if (bot) return;

            const { result, emojis } = extractUsernames(content, type);

            console.log({ result, emojis });

            if (emojis.length === 0) return;

            let doc = await UserGame.findOne({ userId: id });
            if (!doc) doc = await UserGame.create({ userId: id });
            const dataToUpdate = doc[type];

            await doc.updateOne({
              [type]: {
                ...dataToUpdate,
                ...result,
              },
            });

            const emojiAddPromise = emojis.map((em) => m.react(em));
            return Promise.all(emojiAddPromise);
          })
        );

        lastMessageId = messages.last()?.id;
      } catch (error) {
        console.log(error);
      }
    } while (messages.size === 0);
  }

  // console.log(
  //   client.guilds.cache
  //     .get("1123063518334304398")
  //     .members.cache.get("869787183383457844")
  //     .nickname.split(" ")
  // );
  // console.log(client.users.cache.get("869787183383457844"));
  // client.application.commands.set([]);

  new WOK({
    client,
    commandsDir: path.join(__dirname, "./commands"),
    events: {
      dir: path.join(__dirname, "events"),
    },
    disabledDefaultCommands: [
      DefaultCommands.ChannelCommand,
      DefaultCommands.CustomCommand,
      DefaultCommands.Prefix,
      DefaultCommands.RequiredPermissions,
      DefaultCommands.RequiredRoles,
      DefaultCommands.ToggleCommand,
    ],
    cooldownConfig: {
      errorMessage: "Please wait {TIME} before doing that again.",
      botOwnersBypass: false,
      dbRequired: 300,
    },
  });
});
client.login(TOKEN);
