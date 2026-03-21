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
const { Client, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- CORRECCIÓN DE IMPORTACIÓN ---
const db = require('./db.js'); 
const { commandPermissions, snipes, esnipes } = db; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const prefixes = ["Jarvis ", "Jarvis", "edy ", "Edy ", "edy", "Edy", "."];

// Cargar comandos de prefijo
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ('name' in command) client.commands.set(command.name, command);
    }
}

// Cargar Slash Commands
const slashPath = path.join(__dirname, 'slash');
if (fs.existsSync(slashPath)) {
    const slashFiles = fs.readdirSync(slashPath).filter(file => file.endsWith('.js'));
    for (const file of slashFiles) {
        const command = require(path.join(slashPath, file));
        if (command.data && command.data.name) client.commands.set(command.data.name, command);
    }
}

client.once('ready', () => {
    console.log(`Bot listo como ${client.user.tag}`);
});

// Eventos de Snipe
client.on('messageDelete', (message) => {
    if (message.author?.bot || !message.guild) return;
    let channelSnipes = snipes.get(message.channel.id) || [];
    channelSnipes.unshift({
        content: message.content || "Mensaje sin texto",
        author: message.author,
        timestamp: message.createdAt,
        image: message.attachments.first()?.proxyURL || null
    });
    if (channelSnipes.length > 7) channelSnipes.pop();
    snipes.set(message.channel.id, channelSnipes);
});

client.on('messageUpdate', (oldMsg, newMsg) => {
    if (oldMsg.author?.bot || !oldMsg.guild || oldMsg.content === newMsg.content) return;
    let channelEsnipes = esnipes.get(oldMsg.channel.id) || [];
    channelEsnipes.unshift({
        oldContent: oldMsg.content || "Sin texto",
        newContent: newMsg.content || "Sin texto",
        author: oldMsg.author,
        timestamp: new Date()
    });
    if (channelEsnipes.length > 7) channelEsnipes.pop();
    esnipes.set(oldMsg.channel.id, channelEsnipes);
});

// --- ÚNICO EVENTO DE INTERACCIÓN ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Obtenemos el usuario de la DB antes de ejecutar
    const user = db.getUser(interaction.user.id); 

    try {
        // Pasamos interaction, user y db al comando
        await command.execute(interaction, user, db);
    } catch (error) {
        console.error(error);
        const errorMsg = { content: 'Hubo un error al ejecutar el comando.', flags: [MessageFlags.Ephemeral] };
        if (interaction.replied || interaction.deferred) await interaction.followUp(errorMsg);
        else await interaction.reply(errorMsg);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const contentLower = message.content.toLowerCase();
    const prefix = prefixes.find(p => contentLower.startsWith(p.toLowerCase()));
    
    if (prefix) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (commandName) {
            const command = client.commands.get(commandName) || 
                            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (command) {
                const requiredRoleId = commandPermissions.get(command.name);
                if (requiredRoleId && !message.member.roles.cache.has(requiredRoleId)) {
                    return message.reply("No tienes el rol necesario.");
                }
                try {
                    // Para comandos de prefijo, podrías necesitar pasar db y user también:
                    const user = db.getUser(message.author.id);
                    return await command.execute(message, args, user, db);
                } catch (error) {
                    console.error(error);
                    return message.reply("Hubo un error al ejecutar este comando.");
                }
            }
        }
    }

  if (message.mentions.users.has('1292577920149360690') && !message.reference) {
    return message.reply("bro encuerate y manda foto 👀");
}


    const gatillos = ["q", "que", "k", "ke"];
    if (gatillos.includes(message.content.toLowerCase().trim())) {
        const emojiServidor = message.guild.emojis.cache.find(e => e.name === 'fangato');
        return message.reply(emojiServidor ? `so ${emojiServidor}` : "so 🧀");
    }
});

client.login(process.env.TOKEN);
