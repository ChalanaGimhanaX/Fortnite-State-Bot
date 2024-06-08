require("dotenv").config();
const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});

// Function to fetch challenges for a specified season
async function fetchChallenges(season, lang = "en") {
  try {
    const response = await axios.get(`https://api.example.com/v3/challenges?season=${season}&lang=${lang}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch challenges.");
    }
  } catch (error) {
    console.error(chalk.red("Error fetching challenges:"), error.message);
    throw error;
  }
}

client.on("ready", async () => {
  console.log(chalk.bold.green(`Discord Bot ${client.user.tag} is online!`));
  client.user.setPresence({ activities: [{ name: "/help" }] });

  client.commands = new Discord.Collection();
  client.handlers = new Discord.Collection();

  const jsondir = "slash-json";
  const cmdDir = "handlers";

  let avail = [];

  // Fetch existing slash commands
  let cmds = await client.application.commands.fetch();
  cmds.forEach((slashcont) => {
    avail.push(slashcont.name);
  });

  // Load slash commands
  for (const fileName of fs.readdirSync(jsondir)) {
    const fileContent = require(`./${jsondir}/${fileName}`);
    client.commands.set(fileName.split(".")[0], fileContent);
    console.log(chalk.bold.green(`Loaded command ${fileName}`));

    if (avail.find((l) => l === fileName.replace(".json", ""))) {
      console.log(chalk.bold.red(`Command ${fileContent.name} already exists!`));
    } else {
      client.application.commands.create(fileContent)
        .then((da) => {
          console.log(chalk.green.bold(`Registered ${da.name} | ${da.id}`));
        })
        .catch(console.error);
    }
  }

  // Load command handlers
  for (const fileName of fs.readdirSync(cmdDir)) {
    const fileContent = require(path.join(__dirname, cmdDir, fileName));
    client.handlers.set(fileName.split(".")[0], fileContent);
    console.log(chalk.bold.green(`Loaded handler ${fileName}`));
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const cmd = client.handlers.get(interaction.commandName);
    if (cmd) {
      try {
        await cmd.run(client, interaction);
        console.log(chalk.gray(`Executed command ${interaction.commandName} | ${interaction.guildId} | ${interaction.user.id}`));
      } catch (error) {
        console.error("Error executing command:", error);
        interaction.reply({ content: "An error occurred while executing the command.", ephemeral: true });
      }
    } else if (interaction.commandName === "fetchchallenges") {
      const season = interaction.options.getNumber("season") || 0;
      const lang = interaction.options.getString("lang") || "en";

      try {
        const challenges = await fetchChallenges(season, lang);

        if (challenges) {
          const challengesEmbed = new Discord.MessageEmbed()
            .setTitle(`Challenges for Season ${season}`)
            .setColor("RANDOM")
            .setDescription(JSON.stringify(challenges, null, 2));
          interaction.reply({ embeds: [challengesEmbed] });
        } else {
          interaction.reply({ content: "Failed to fetch challenges.", ephemeral: true });
        }
      } catch (error) {
        console.error("Error fetching challenges:", error.message);
        interaction.reply({ content: "An error occurred while fetching challenges.", ephemeral: true });
      }
    } else {
      interaction.reply({ content: "Command not found!", ephemeral: true });
    }
  }
});

client.on("guildCreate", async (guild) => {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    const addedBy = guild.ownerId
      ? await guild.members.fetch(guild.ownerId).then((member) => member.user.tag)
      : "Unknown";

    const embed = new Discord.MessageEmbed()
      .setTitle("New Server Added")
      .setColor("GREEN")
      .setDescription(`The bot has been added to a new server!`)
      .addField("Server Name", guild.name, true)
      .addField("Server ID", guild.id, true)
      .addField("Added by", addedBy, true)
      .setTimestamp();

    await axios.post(webhookUrl, {
      embeds: [embed],
    });

    console.log(chalk.green.bold(`Bot added to a new server: ${guild.name} (ID: ${guild.id})`));
  } catch (error) {
    console.error(chalk.red("Error sending webhook notification:"), error.message);
  }
});

client.login(process.env.TOKEN).catch((error) => {
  console.error(chalk.red("Failed to login:"), error);
});
