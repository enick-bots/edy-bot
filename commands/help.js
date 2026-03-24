const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h', 'ayuda'],
    async execute(message, args) {
        // Unimos todos los argumentos en una sola frase para buscar palabras clave
        const textoCompleto = args.join(" ").toLowerCase();

        // --- SECCIÓN PREFIX ---
        // Se activa si la frase contiene "prefix"
        if (textoCompleto.includes('prefix')) {
            const prefixEmbed = new EmbedBuilder()
                .setTitle("📜 Comandos de Prefix")
                .setDescription("Aquí Esta la lista de comandos disponibles el prefix del bot es (. edy, edy , Edy, Edy , Jarvis , jarvis)")
                .addFields(
                    { name: "Forced Nickname (FN)", value: "`.fn` - Ponle un apodod forzado a alguien. [Uso: `.fn <@usuario> <new nickname>]" },
                    { name: "Snipe (s)", value: "`.s` - Usalo para ver un mensaje borrado. [Uso: `.s <número>]"},
                    { name: "Edit Snipe (es)", value: "`.es` - Usalo para ver un mensaje editado. [Uso: `.es <número>]"},
                    { name: "Quote", value: "`.quote` - Crea una imagen con el mensaje que quieras. [Uso: `.quote <texto>` o responde a un mensaje con `.quote`]" },
                    { name: "Purge", value: "`.purge` - Borra varios mensajes a la vez. [Uso: `.purge <número>]" },
                    { name: "Tag", value : "`.tag` - Hazle un spam de tags a alguien. [Uso: `.tag <cantidad> <@usuario>]" },
                    { name: "Configuración", value: "`.config` - Configura roles para comandos. [Uso: `.config <cmd> <id/rol>]" },
                    { name: "Add Frases (add)", value: "`.add` - Agrega frases a los comandos. [Uso: `.add <nombre del cmd del comando> <frase>]" },
                    { name: "Edy", value: "`.edy` - Suelta una frase aleatoria de la lista edy." },
                    { name: "Kiqbo", value: "`.kiqbo` - Suelta una frase aleatoria de la lista kiqbo." },
                    { name: "master", value: "`.master` - Suelta una frase aleatoria de la lista kiqbo." },
                    { name: "flor", value: "`.flor` - Suelta una frase aleatoria de la lista kiqbo." },
                    { name: "fraster", value: "`.fraster` - Suelta una frase aleatoria de la lista kiqbo." },
                    { name: "gustambo", value: "`.gustambo` - Suelta una frase aleatoria de la lista gustambo." },
                    { name: "copy", value: "`.copy` - Suelta un copy." },
                    { name: "pics", value: "`.pics` - Muestra la lista de fotos disponibles. [Uso: `.pics <goat/bad/meme>]" },
                    { name : "pic (g/b/m)", value: "Uso: `rpg`,`rpb`,`rpr` - Muestra una foto aleatoria de la categoria elegida (goat, bad o meme)." },
                    { name : "tfa", value: "`.tfa` - Muestra tu nivel de atrocidad (cmd de flor)" },
                    { name: "frio", value: "`.frio` - Muestra tu nivel de frio (cmd de emi)" }
                )
                .setFooter({ text: "Hay comandos secretos de prefix" })
                .setColor(0x2f3136);
            
            return message.reply({ embeds: [prefixEmbed] });
        }

        // --- SECCIÓN SLASH ---
        // Se activa si la frase contiene "slash"
        if (textoCompleto.includes('slash')) {
            const slashEmbed = new EmbedBuilder()
                .setTitle("🚀 Slash Commands")
                .setDescription("Lista de comandos de barra (/) disponibles:")
                .addFields(
                    { name: "/perfil", value: "Mira las estadísticas de un usuario. [Uso: `/perfil @usuario`]" },
                    { name: "/quitar-coins", value: "Resta monedas a un usuario (permite deuda). [Uso: `/quitar-coins @usuario cantidad` (solo admins)]" },
                    { name: "/imposter", value: "Inicia una partida de impostor en el canal. [Uso: `/imposter maxplayers: imposters: tema: pistas:`]" },
                    { name: "/dar-coins", value: "Da monedas a un usuario. [Uso: `/dar-coins @usuario cantidad`] (solo admins)" },
                    { name: "/play snake", value: "Juega al Snake dentro de Discord. [Uso: `/play snake`]" },
                    { name: "/play slots", value: "Juega a slot dentro de Discord. [Uso: `/play slots `]" },
                    { name: "play penaltis", value: "Juega a penaltis dentro de Discord. [Uso: `/play penaltis`]" },
                    { name: "/play blackjack", value: "Juega al blackjack dentro de Discord. [Uso: `/play blackjack`]" },
                    { name: "/wordle", value: "Juega al Wordle dentro de Discord. [Uso: `/wordle`]" },
                    { name: "/dar-spins", value: "Dale spins a un usuario. [Uso: `/dar-spins @usuario cantidad` (solo admins)]" }
                )
                .setFooter({ text: "Uson los slash de casino gays" })
                .setColor(0x2f3136);

            return message.reply({ embeds: [slashEmbed] });
        }

        // --- RESPUESTA INICIAL SI NO DETECTA "PREFIX" NI "SLASH" ---
        const helpMain = new EmbedBuilder()
            .setTitle("📜 Menú de Ayuda")
            .setDescription("Especifica qué tipo de comandos quieres ver:")
            .addFields(
                { name: "⌨️ Comandos de Prefix", value: "Usa `.help prefix` para ver estos comandos." },
                { name: "🚀 Comandos Slash", value: "Usa `.help slash` para ver los comandos de barra." },
                { name: "Prefixes", value: "El bot responde a los siguientes prefixes: `.,edy`, `edy `, `Edy`, `Edy `, `Jarvis`, `jarvis`" }
            )
            .setFooter({ text: "Algunos prefix sirven cuando quieren 🐒" })
            .setColor(0x2f3136);

        return message.reply({ embeds: [helpMain] });
    }
};
