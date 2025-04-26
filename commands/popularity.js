const { CommandType } = require("wokcommands");
const gameThread = require("../models/gameThread");
const { generateGeneralEmbed } = require("../utils/components");
const ms = require("ms"); // npm i ms if not installed

module.exports = {
  description: "Get the most active games based on plays within a specific duration.",
  type: CommandType.SLASH,
  options: [
    {
      name: "duration",
      description: "Time range (e.g., 7d, 1m, 1y)",
      type: 3, // STRING
      required: true,
    },
    {
      name: "count",
      description: "How many top games to show (e.g., 5, 10)",
      type: 4, // INTEGER
      required: false,
    },
  ],
  callback: async ({ interaction }) => {
    try {
      console.log('hi')
      const durationInput = interaction.options.getString("duration");
      const count = interaction.options.getInteger("count") || 5;
      const durationMs = ms(durationInput);

      if (!durationMs || isNaN(durationMs)) {
        return interaction.reply({
          content: "❌ Invalid duration format. Try values like `30d`, `1m`, `2w`, or `1y`.",
          ephemeral: true,
        });
      }

      const now = Date.now();
      const since = new Date(now - durationMs);

      const recentGames = await gameThread.find({ updatedAt: { $gte: since } });

      const gamesWithCounts = recentGames.map((game) => {
        const monthlyPlays = game.allTimePlays.filter(date => new Date(date) >= since).length;
        return { ...game._doc, monthlyPlays };
      });

      const topGames = gamesWithCounts
        .filter(g => g.monthlyPlays > 0)
        .sort((a, b) => b.monthlyPlays - a.monthlyPlays)
        .slice(0, count);

      if (topGames.length === 0) {
        return interaction.reply("😶 No game activity in the specified duration.");
      }

      const embedDescription = topGames
        .map((game, index) =>
          `**#${index + 1}:** [${game.gameName}](https://discord.com/channels/${process.env.GUILD_ID}/${game.threadId}) — \`${game.monthlyPlays} plays\``)
        .join("\n");

      const embed = generateGeneralEmbed({
        title: `🔥 Top ${topGames.length} Games (${durationInput})`,
        description: embedDescription,
      });

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Error in popularity command:", err);
      return interaction.reply({
        content: "🚨 Something went wrong. Try again later.",
        ephemeral: true,
      });
    }
  },
};
