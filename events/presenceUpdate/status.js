// const { ActivityType } = require("discord.js");
// const locationTimezone = require("node-location-timezone");

// const { generateGeneralEmbed } = require("../../utils/components");
// const gameThread = require("../../models/gameThread");

// const wrongGames = [
//   "visual studio code",
//   "bluestacks 5",
//   // "proudly written in kotlin using discord4j",
// ];

// const userActivityMap = new Map();

// module.exports = async (oldPresence, newPresence) => {
//   try {
//     if (!oldPresence) return;
//     if (newPresence.activities.length === 0) return;

//     const { guild, userId, activities, client } = newPresence;

//     let str = "";
//     let image, thread, doc;

//     const threadChannel = client.channels.cache.get(
//       process.env.THREADS_CHANNEL_ID
//     );

//     const {
//       roles,
//       user: { bot },
//     } = await guild.members.fetch(userId);

//     if (bot) return;
//     for (const activity of activities) {
//       // console.log(activity);

//       const { type, state, details, assets, name } = activity;

//       console.log(ActivityType[type], " ", name);

//       // if (type !== ActivityType.Playing) continue;
//       if (wrongGames.includes(name.toLowerCase())) continue;
//       // if (type === 6) continue; // vc channel activity

//       const isSameActivity = oldPresence.activities.some(
//         (oldActivity) => name === oldActivity.name
//       );

//       if (isSameActivity) continue;

//       const userActivities = userActivityMap.get(userId);

//       const newActivity = { name, lastPlayed: Date.now() };

//       if (!userActivities) userActivityMap.set(userId, [newActivity]);

//       if (userActivities) {
//         const i = userActivities.findIndex((a) => a.name === name);

//         if (i === -1) lastPlayedActivity.push(newActivity);

//         if (i !== 1) {
//           const oldActivity = userActivities[i];
//           lastPlayedActivity[i] = newActivity;
//           if (oldActivity.lastPlayed + 1000 * 60 * 10 > Date.now()) continue;
//         }
//       }

//       console.log(userActivities);

//       doc = await gameThread.findOne({ gameName: name });

//       if (doc) {
//         const isOlderThan2hrs =
//           doc.updatedAt.getTime() + 1000 * 60 * 60 * 2 < Date.now();

//         doc.activitiesPlayed = isOlderThan2hrs ? 1 : ++doc.activitiesPlayed;

//         thread = client.channels.cache.get(doc.threadId);
//         await doc.save();
//       }

//       if (!doc) {
//         thread = await threadChannel.threads.create({ name });

//         doc = await gameThread.create({ gameName: name, threadId: thread.id });
//       }

//       // console.log(assets);
//       if (assets)
//         image =
//           assets.largeImageURL({ size: 2048 }) ||
//           assets.smallImageURL({ size: 2048 });

//       const strDetails =
//         state || details
//           ? `**Details**: ${state ? `${state} | ` : ""} ${details ?? ""}`
//           : "";

//       str = `**${ActivityType[type]}:** ${name}\n ${strDetails}`;
//     }

//     // console.log(str);
//     // console.log(image);

//     if (!str) return;

//     // if (bot) return;

//     const countryName =
//       roles.highest.name === "United Kingdom"
//         ? "The United Kingdom of Great Britain and Northern Ireland"
//         : roles.highest.name;

//     const country = locationTimezone.findCountryByName(countryName);

//     // console.log(country);

//     const curDate = new Date();

//     const memberLocalTime = curDate.toLocaleTimeString([], {
//       timeZone: country?.timezones[0],
//       hour: "numeric",
//       minute: "numeric",
//       hour12: true,
//     });

//     // console.log(member.voice);

//     const embed = generateGeneralEmbed({
//       description: `${member} | <t:${Math.floor(curDate / 1000)}:t> | ${
//         memberLocalTime ?? "No time found"
//       }${
//         member.voice.channel ? `\n\n Join me here:${member.voice.channel}` : ""
//       }\n**Times Played In Last 2 hours**: ${doc.activitiesPlayed}\n\n ${str}`,
//       image,
//     });

//     const presenceChannel = client.channels.cache.get(
//       process.env.ACTIVITY_CHANNEL
//     );

//     await presenceChannel.send({ embeds: [embed] });

//     await thread.send({ embeds: [embed] });
//   } catch (error) {
//     console.log(error);
//   }
// };
const { ActivityType } = require("discord.js");
const locationTimezone = require("node-location-timezone");

const { generateGeneralEmbed } = require("../../utils/components");
const gameThread = require("../../models/gameThread");

const wrongGames = ["visual studio code", "bluestacks 5"];

const userActivityMap = new Map();

module.exports = async (oldPresence, newPresence) => {
  try {
    if (!oldPresence) return;
    if (newPresence.activities.length === 0) return;

    const { guild, userId, activities, client } = newPresence;

    if (guild.id !== process.env.GUILD_ID) return;

    let str = "";
    let image, thread, doc, isNew;

    const threadChannel = client.channels.cache.get(
      process.env.THREADS_CHANNEL_ID
    );

    const member = await guild.members.fetch(userId);
    const {
      roles,
      user: { bot },
    } = member;

    if (bot) return;

    for (const activity of activities) {
      const { type, state, details, assets, name } = activity;


      if (type !== ActivityType.Playing) continue;

      if (wrongGames.includes(name.toLowerCase())) continue;

      const isSameActivity = oldPresence.activities.some(
        (oldActivity) => name === oldActivity.name
      );

      if (isSameActivity) continue;
      const userActivities = userActivityMap.get(userId);
      const newActivity = { name, lastPlayed: Date.now() };
      // console.log(userActivities);

      if (!userActivities) userActivityMap.set(userId, [newActivity]);
      if (userActivities) {
        const i = userActivities.findIndex((a) => a.name === name);
        if (i === -1) userActivities.push(newActivity);
        if (i !== -1) {
          const oldActivity = userActivities[i];
          userActivities[i] = newActivity;
          if (oldActivity.lastPlayed + 1000 * 60 * 2 > Date.now()) {
            // console.log("repeated");
        
            continue;
        }        
        }
      }

      isNew = true;

      doc = await gameThread.findOne({ gameName: name });
      if (doc) {
        const userPlayEntry = doc.userPlays.find(
          (entry) => entry.userId === userId
        );
        if (userPlayEntry) {
          userPlayEntry.plays += 1; // Increment the user's play count
        } else {
          doc.userPlays.push({ userId, plays: 1 }); // Add a new user play entry
        }

        doc.allTimePlays.push(new Date());

        if (
          doc.lastThreshold.getTime() + 1000 * 60 * 60 * 24 * 3 <
          Date.now()
        ) {
          doc.totalPlays = 1;
          doc.lastThreshold = new Date();
        } else doc.totalPlays += 1; // Increment the total play count
        thread = client.channels.cache.get(doc.threadId);
        await doc.save();
      }

      if (!doc) {
        thread = await threadChannel.threads.create({ name });
        doc = await gameThread.create({
          gameName: name,
          threadId: thread.id,
          userPlays: [{ userId, plays: 1 }],
          totalPlays: 1,
          lastThreshold: new Date(),
        });
      }

      if (assets)
        image =
          assets.largeImageURL({ size: 2048 }) ||
          assets.smallImageURL({ size: 2048 });

      const strDetails =
        state || details
          ? `**Details**: ${state ? `${state} | ` : ""} ${details ?? ""}`
          : "";

      str = `${strDetails}`;
    }

    if (!isNew) return;

    const countryName =
      roles.highest.name === "United Kingdom"
        ? "The United Kingdom of Great Britain and Northern Ireland"
        : roles.highest.name;

    const country = locationTimezone.findCountryByName(countryName);

    const curDate = new Date();

    const memberLocalTime = curDate.toLocaleTimeString([], {
      timeZone: country?.timezones[0],
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    // const embed = generateGeneralEmbed({
    //   description: `**Post's in the last 3 days**: \`${doc.totalPlays}\`\n${thread}\n\n ${str}`,
    //   image,
    // });

    const content = `### ${thread} | **Post's in the last 3 days**: \`${doc.totalPlays}\``;
    const presenceChannel = client.channels.cache.get(
      process.env.ACTIVITY_CHANNEL
    );
    await presenceChannel.send({ content });
    // await presenceChannel.send({ embeds: [embed] });

    const userPlayEntry = doc.userPlays.find(
      (entry) => entry.userId === userId
    );

    const threadEmbed = generateGeneralEmbed({
      description: `${member} | <t:${Math.floor(curDate / 1000)}:t> | ${
        memberLocalTime ?? "No time found"
      }${
        member.voice.channel ? `\n\n Join me here:${member.voice.channel}` : ""
      }\n\n**Game:** ${doc.gameName}\n**Times Played:** \`${
        userPlayEntry.plays
      }\`\n\n${str}`,
      image,
    });

    await thread.send({ embeds: [threadEmbed] });

    doc.totalMessagesSent += 1;
    await doc.save();
  } catch (error) {
    console.log(error);
  }
};
