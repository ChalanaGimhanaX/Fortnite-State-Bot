const Discord = require("discord.js");
const axios = require("axios").default;
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  await interaction.deferReply();
  let player = interaction.options.getString('player');

  try {
    // Fetch player data
    let req = await axios.get("https://fortniteapi.io/v1/lookup", {
      params: {
        username: player
      },
      headers: {
        Authorization: process.env.FNAPIIO
      }
    });

    if (!req.data.result) {
      const errorEmbed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("Error")
        .setDescription(`We were unable to get account info on ${player}`)
        .setFooter(req.data.error.code || "Unknown error");

      return interaction.editReply({ embeds: [errorEmbed] });
    }

    // Fetch player stats
    req = await axios.get("https://fortniteapi.io/v1/stats", {
      params: {
        account: req.data.account_id
      },
      headers: {
        Authorization: process.env.FNAPIIO
      }
    });

    const stats = req.data;
    const globalStats = stats.global_stats;

    // Calculate average K.D.
    const averageKD = Math.round((globalStats.squad.kd + globalStats.duo.kd + globalStats.solo.kd) / 3);

    // Create the embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`📊 Stats for ${stats.name}`)
      .setColor("#9370DB")
      .setThumbnail(stats.avatar)
      .addFields(
        { name: "Battlepass Level", value: stats.account.level.toString(), inline: true },
        { name: "Victories", value: (globalStats.squad.placetop1 + globalStats.duo.placetop1 + globalStats.solo.placetop1).toString(), inline: true },
        { name: "Average K.D", value: averageKD.toString(), inline: true },
        { name: "Total Kills", value: (globalStats.squad.kills + globalStats.duo.kills + globalStats.solo.kills).toString(), inline: true },
        { name: '\u200B', value: '\u200B' }, // Empty field for spacing
        { name: "🏆 Solo Stats", value: `
          **Placetop1:** ${globalStats.solo.placetop1 || 'N/A'}
          **KD:** ${globalStats.solo.kd || 'N/A'}
          **Winrate:** ${globalStats.solo.winrate || 'N/A'}
          **Total Kills:** ${globalStats.solo.kills || 'N/A'}
          **Matches Played:** ${globalStats.solo.matchesplayed || 'N/A'}
          **Minutes Played:** ${globalStats.solo.minutesplayed || 'N/A'}
          **Score:** ${globalStats.solo.score || 'N/A'}
          **Players Outlived:** ${globalStats.solo.playersoutlived || 'N/A'}
        `, inline: true },
        { name: "🏆 Duo Stats", value: `
          **Placetop1:** ${globalStats.duo.placetop1 || 'N/A'}
          **KD:** ${globalStats.duo.kd || 'N/A'}
          **Winrate:** ${globalStats.duo.winrate || 'N/A'}
          **Total Kills:** ${globalStats.duo.kills || 'N/A'}
          **Matches Played:** ${globalStats.duo.matchesplayed || 'N/A'}
          **Minutes Played:** ${globalStats.duo.minutesplayed || 'N/A'}
          **Score:** ${globalStats.duo.score || 'N/A'}
          **Players Outlived:** ${globalStats.duo.playersoutlived || 'N/A'}
        `, inline: true },
        { name: "🏆 Squad Stats", value: `
          **Placetop1:** ${globalStats.squad.placetop1 || 'N/A'}
          **KD:** ${globalStats.squad.kd || 'N/A'}
          **Winrate:** ${globalStats.squad.winrate || 'N/A'}
          **Total Kills:** ${globalStats.squad.kills || 'N/A'}
          **Matches Played:** ${globalStats.squad.matchesplayed || 'N/A'}
          **Minutes Played:** ${globalStats.squad.minutesplayed || 'N/A'}
          **Score:** ${globalStats.squad.score || 'N/A'}
          **Players Outlived:** ${globalStats.squad.playersoutlived || 'N/A'}
        `, inline: true }
      )
      .setFooter(`Requested by: ${interaction.user.tag}`, interaction.user.displayAvatarURL())
      .setTimestamp();

    interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(chalk.red("Error fetching Fortnite stats:", error));
    interaction.editReply({ content: "An error occurred, please try later :)" });
  }
};
