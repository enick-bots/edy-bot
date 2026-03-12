const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h', 'ayuda'],
    async execute(message, args) {
        const helpEmbed = new EmbedBuilder()
            .setTitle("📜 Lista de Comandos")
            .setDescription("Aquí Esta la lista de comandos disponibles el prefix del bot es (. edy, edy , Edy, Edy , Jarvis , jarvis)")
            .addFields(
                { name: "Forced Nickname (FN)", value: "`.fn` - Ponle un apodod forzado a alguien. [Uso: `.fn <@usuario> <new nickname>`]" },
                { name: "Snipe (s)", value: "`.s` - Usalo para ver un mensaje borrado. [Uso: `.s <número>`]"},
                { name: "Edit Snipe (es)", value: "`.es` - Usalo para ver un mensaje editado. [Uso: `.es <número>`]"},
                { name: "Quote", value: "`.quote` - Crea una imagen con el mensaje que quieras. [Uso: `.quote <texto>` o responde a un mensaje con `.quote`]" },
                { name: "Purge", value: "`.purge` - Borra varios mensajes a la vez. [Uso: `.purge <número>`]" },
                { name: "Tag", value : "`.tag` - Hazle un spam de tags a alguien. [Uso: `.tag <cantidad> <@usuario>`]" },
                { name: "Configuración", value: "`.config` - Configura roles para comandos. [Uso: `.config <cmd> <id/rol>`]" },
                { name: "Add Frases (add)", value: "`.add` - Agrega frases a los comandos. [Uso: `.add <nombre del cmd del comando> <frase>`]" },
                { name: "Edy", value: "`.edy` - Suelta una frase aleatoria de la lista edy." },
                { name: "Kiqbo", value: "`.kiqbo` - Suelta una frase aleatoria de la lista kiqbo." },
                { name: "master", value: "`.master` - Suelta una frase aleatoria de la lista kiqbo." },
                { name: "flor", value: "`.flor` - Suelta una frase aleatoria de la lista kiqbo." },
                { name: "fraster", value: "`.fraster` - Suelta una frase aleatoria de la lista kiqbo." },
                { name: "gustambo", value: "`.gustambo` - Suelta una frase aleatoria de la lista gustambo." },
                { name: "copy", value: "`.copy` - Suelta un copy." },
                { name: "pics", value: "`.pics` - Muestra la lista de fotos disponibles. [Uso: `.pics <goat/bad/meme>`]" },
                { name : "pic (g/b/m)", value: "Uso: `rpg`,`rpb`,`rpr` - Muestra una foto aleatoria de la categoria elegida (goat, bad o meme)." },
                { name : "tfa", value: "`.tfa` - Muestra tu nivel de atrocidad (cmd de flor)" },
                { name: "frio", value: "`.frio` - Muestra tu nivel de frio (cmd de emi)" },
            )
            .setFooter({ text: "Algunos prefix sirven cuando quieren :monkey:" })
            .setColor(0x2f3136);

        return message.reply({ embeds: [helpEmbed] });
    }
};
