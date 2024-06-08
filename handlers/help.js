const Discord = require("discord.js");

module.exports = {
    name: "help",
    description: "Display available commands.",
    async run(client, interaction) {
        const currentDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" });
        const helpEmbed = new Discord.MessageEmbed()
            .setTitle("🚀 Fortnite Bot Commands")
            .setDescription("Explore the available commands and conquer Fortnite!")
            .setColor("#9370DB")
            .setThumbnail("https://example.com/your-thumbnail.png")
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: '🔍 Player Details', value: '`/state "player name"`' },
                { name: '📰 News', value: '`/news "mode"`' },
                { name: '🗺️ Current Map', value: '`/map`' },
                { name: '💎 Cosmetic Details', value: '`/cosmetics "cosmetic name"`' },
                { name: '🛠️ Item Details', value: '`/item "item name"`' },
                { name: '\u200B', value: '\u200B' }
            )
            .setFooter(`Created by ChAlanA`, "https://example.com/your-logo.png")
            .setTimestamp();

        const moreCommandsText = "More commands coming soon.";
        const lastUpdatedText = `Last Updated: 24/06/08`;

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('moreCommands')
                    .setLabel(moreCommandsText)
                    .setStyle('PRIMARY')
                    .setDisabled(true),
                new Discord.MessageButton()
                    .setCustomId('lastUpdated')
                    .setLabel(lastUpdatedText)
                    .setStyle('SECONDARY')
                    .setDisabled(true)
            );

        interaction.reply({
            embeds: [helpEmbed],
            components: [row]
        });
    }
};
