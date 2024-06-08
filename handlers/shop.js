const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const response = await axios.get("https://your-api-endpoint.com/v2/lookup");

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    const data = response.data;

    if (!data || !data.result) {
      throw new Error("Invalid response data from API");
    }

    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Fortnite Shop")
      .setFooter(client.user.username, client.user.displayAvatarURL());

    if (data.shop && data.shop.length > 0) {
      for (const item of data.shop) {
        const grantedItems = item.granted || [];
        const grantedItemsText = grantedItems
          .map((grant) => `- ${grant.name} (${grant.rarity.name})`)
          .join("\n");

        const itemDescription = `**${item.displayName}**\n${item.displayDescription}\n\nGranted Items:\n${grantedItemsText}`;

        embed.addField(
          `${item.mainType} - ${item.rarity.name}`,
          itemDescription,
          true
        );
      }
    } else {
      embed.setDescription("No shop items available at the moment.");
    }

    interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite Shop command:", error.message));
    interaction.reply({
      content: "An error occurred! Please try again later :)",
    });
  }
};