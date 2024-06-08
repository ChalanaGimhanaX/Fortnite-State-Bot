const Discord = require("discord.js");
const axios = require("axios").default;

module.exports.run = async (client, interaction) => {
  try {
    const name = interaction.options.getString("name");

    const req = await axios.get("https://fortnite-api.com/v2/cosmetics/br/search", {
      params: {
        language: "en",
        name: name,
      },
    });

    if (req.status === 200) {
      const data = req.data;

      if (data.status === 200) {
        const cosmetic = data.data;

        // Get the requester's name and avatar
        const requester = interaction.member;
        const requesterName = requester.displayName;
        const requesterAvatar = requester.user.displayAvatarURL();

        // Get the current timestamp
        const currentDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }); // Set timezone to Asia/Colombo

        const embed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle(`Showing item info for: ${cosmetic.name}`)
          .setThumbnail(cosmetic.images.icon)
          .setDescription(cosmetic.description)
          .addFields(
            { name: "Name", value: cosmetic.name },
            { name: "ID", value: cosmetic.id },
            { name: "Type", value: cosmetic.type.displayValue }
          )
          .setFooter(`Requested by ${requesterName} | Last Updated: ${currentDate}`, requesterAvatar);

        if (cosmetic.set) {
          embed.addField(
            `Set Info for ${cosmetic.set.value}`,
            `${cosmetic.set.text}`
          );
        }

        return interaction.reply({ embeds: [embed] });
      } else {
        return interaction.reply({
          embeds: [
            new Discord.MessageEmbed()
              .setTitle(`OOPS! Didn't find ${name}`)
              .setColor("RED")
              .setDescription("Please provide a correct name :)"),
          ],
        });
      }
    } else {
      throw new Error("Non-200 status code from Fortnite API");
    }
  } catch (error) {
    console.error(error);

    return interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("API ERROR. Please try later :)"),
      ],
    });
  }
};
