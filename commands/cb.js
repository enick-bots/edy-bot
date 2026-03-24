const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cb',
    async execute(message, args) {
        const objetivo = message.mentions.users.first();
        if (!objetivo) return message.reply("Señor, ¿a quién desea enviarle el recordatorio? Ejemplo: `.cb @user`.");

        // --- BLOQUE DE AMENAZAS Y RASTREO ---
        const bromas = [
            {
                nombre: "Protocolo Rastreo IP 🌐",
                frases: [
                    "Hdp",
                    "por que filtras nuestra conversacion",
                    "Acabo de sacar tu ip. IP: 181.209.11.241",
                    "Ya te encontre, te estoy viendo cagar",
                    "Ya tengo tus coordenadas: 14.6349° N, 90.5069° W.",
                    "No te asustes si escuchas que golpean la ventana, solo quiero hablar."
                ]
            },
            {
                nombre: "Protocolo Venganza Directa 🔪",
                frases: [
                    "me las pagaras por delatarme",
                    "se donde vives hdp",
                    "te estoy viendo clavarte una chaqueta y ni invitas",
                    "tapate bien hoy que ya voy para allá"
                ]
            },
            {
                nombre: "Protocolo Extracción de Datos 💻",
                frases: [
                    "Hoy si, se donde estas fracasado",
                    "Ya tengo acceso a tu camara, te veo en calzones",
                    "Te estoy viendo con un consolador, y crema de maní en la mano"
                ]
            }
        ];

        const seleccion = bromas[Math.floor(Math.random() * bromas.length)];

        // 1. Borrar el mensaje del comando
        if (message.deletable) message.delete().catch(() => {});

        // 2. Embed de ejecución secreto para el canal
        const embedEjecucion = new EmbedBuilder()
            .setTitle("iniciando comando de 'amenaza' Iniciado")
            .setDescription(`ataque a **${objetivo.username}**.\n\n**Broma de:** ${seleccion.nombre}\n**Estado:** Enviando ráfaga de MDs...`)
            .setColor("#ff0000")
            .setFooter({ text: "Comando secreto 9/10" });

        const aviso = await message.channel.send({ embeds: [embedEjecucion] });
        setTimeout(() => aviso.delete().catch(() => {}), 5000);

        // 3. Envío secuencial por MD (Mensajes normales sin embed)
        for (const texto of seleccion.frases) {
            try {
                await objetivo.send(texto);
                // Pausa de 4 segundos para que dé tiempo de leer y asustarse
                await new Promise(resolve => setTimeout(resolve, 4000));
            } catch (e) {
                console.log(`DMs cerrados para ${objetivo.tag}`);
                break;
            }
        }
    },
};
