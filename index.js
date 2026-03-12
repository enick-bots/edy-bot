const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot online!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor de salud escuchando en el puerto ${PORT}`);
});

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { commandPermissions, snipes, esnipes } = require('./db.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
// 1. IMPORTANTE: Ordenar prefijos de más largo a más corto
const prefixes = ["Jarvis ", "Jarvis", "edy ", "Edy ", "edy", "Edy", "."];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command) {
        client.commands.set(command.name, command);
    }
}

const slashPath = path.join(__dirname, 'slash');
if (fs.existsSync(slashPath)) {
    const slashFiles = fs.readdirSync(slashPath).filter(file => file.endsWith('.js'));
    for (const file of slashFiles) {
        const filePath = path.join(slashPath, file);
        const command = require(filePath);
        if (command.data && command.data.name) {
            client.commands.set(command.data.name, command);
        }
    }
}

client.once('ready', () => {
    console.log(`Bot listo como ${client.user.tag}`);
});

client.on('messageDelete', (message) => {
    if (message.author?.bot || !message.guild) return;
    let channelSnipes = snipes.get(message.channel.id) || [];
    const snipeData = {
        content: message.content || "Mensaje sin texto",
        author: message.author,
        timestamp: message.createdAt,
        image: message.attachments.first()?.proxyURL || null
    };
    channelSnipes.unshift(snipeData);
    if (channelSnipes.length > 7) channelSnipes.pop();
    snipes.set(message.channel.id, channelSnipes);
});

client.on('messageUpdate', (oldMsg, newMsg) => {
    if (oldMsg.author?.bot || !oldMsg.guild || oldMsg.content === newMsg.content) return;
    let channelEsnipes = esnipes.get(oldMsg.channel.id) || [];
    const esnipeData = {
        oldContent: oldMsg.content || "Sin texto",
        newContent: newMsg.content || "Sin texto",
        author: oldMsg.author,
        timestamp: new Date()
    };
    channelEsnipes.unshift(esnipeData);
    if (channelEsnipes.length > 7) channelEsnipes.pop();
    esnipes.set(oldMsg.channel.id, channelEsnipes);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error al ejecutar el slash command.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Hubo un error al ejecutar el slash command.', ephemeral: true });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // 2. Lógica mejorada de detección de prefijo
    const contentLower = message.content.toLowerCase();
    const prefix = prefixes.find(p => contentLower.startsWith(p.toLowerCase()));
    
    if (prefix) {
        // Quitamos el prefijo y limpiamos espacios al inicio y final
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (commandName) {
            const command = client.commands.get(commandName) || 
                            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (command) {
                const requiredRoleId = commandPermissions.get(command.name);
                if (requiredRoleId && !message.member.roles.cache.has(requiredRoleId)) {
                    return message.reply("No tienes el rol necesario configurado en .config para usar este comando.");
                }
                try {
                    return await command.execute(message, args);
                } catch (error) {
                    console.error(error);
                    return message.reply("Hubo un error al ejecutar este comando.");
                }
            }
        }
    }

    // Respuestas automáticas (fuera del prefijo)
    const personaEspecial = '1292577920149360690';
    if (message.mentions.has(personaEspecial)) {
        return message.reply("bro encuerate y manda foto 👀");
    }

    const gatillos = ["q", "que", "k", "ke"];
    if (gatillos.includes(message.content.toLowerCase().trim())) {
        const emojiServidor = message.guild.emojis.cache.find(e => e.name === 'fangato');
        const respuesta = emojiServidor ? `so ${emojiServidor}` : "so 🧀";
        return message.reply(respuesta);
    }
});

client.login(process.env.TOKEN);
