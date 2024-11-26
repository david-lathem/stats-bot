const { CommandType } = require("wokcommands");
const config = require("../config.json");

const gameMsgSchema = require("../models/game_message");
const { sendMessage, setupGameData } = require("../utils/async");
const { replyInteraction, createDoc } = require("../utils/utils");

const { platforms, gameHistoryChannelId } = config;
const threadsObj = {};

module.exports = {
	description: "Status Command",
	type: CommandType.SLASH,
	options: [
		{
			name: "thread",
			description: "choose your thread",
			type: 3,
			required: true,
			autocomplete: true,
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
			name: "platform",
			description: "select the platform",
			type: 3,
			required: true,
			choices: platforms.map((platform) => ({
				name: platform,
				value: platform,
			})),
		},
		{
			name: "media",
			description: "put any attachment",
			type: 11,
		},
		{
			name: "text",
			description: "text as optional",
			type: 3,
		},
	],
	autocomplete: async (_, WORD_, interaction) => {
		try {
			const channel = await interaction.guild.channels.fetch(
				gameHistoryChannelId
			);

			const threadsCollection = await channel.threads.fetch();

			const values = [...threadsCollection.threads.values()];

			const namesArray = values.reduce((acc, cur) => {
				const threadName = cur.name;

				threadsObj[threadName] = cur.id;

				acc.push(threadName);

				return acc;
			}, []);

			return namesArray;
		} catch (error) {
			console.log(error);
			return ["Something went wrong"];
		}
	},

	callback: async ({ interaction }) => {
		try {
			const thread = interaction.options.getString("thread");
			const isCorrectThread = threadsObj[thread];

			if (!isCorrectThread) {
				await interaction.reply({
					content:
						"Wrong thread, please select thread only from game history channel!",
					ephemeral: true,
				});
				return;
			}

			replyInteraction(interaction);

			const [embed, row, mongoData, url] = setupGameData(
				interaction,
				isCorrectThread,
				thread
			);

			const message = await sendMessage(interaction.guild, embed, row, url);

			mongoData.messageId = message.id;

			createDoc(gameMsgSchema, mongoData);
		} catch (error) {
			console.log(error);
		}
	},
};
