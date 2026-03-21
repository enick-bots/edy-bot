module.exports = {
    name: 'cb',
    async execute(message, args) {
        const objetivo = message.mentions.users.first();
        if (!objetivo) return message.reply("Menciona a alguien, pana. Ejemplo: `.troll @user` conceptos");

        // --- BLOQUE DE BROMAS ---
        
        // Broma 1: Estilo "Confusión"
        const broma1 = [
            "me las pagaras por delatarme",
            "se donde vives",
            "te estoy viendo clavarte una chaqueta y ni invitas",
            "tapate bien hoy"
        ];

        // Broma 2: Estilo "Aburrido"
        const broma2 = [
            "hdp",
            "por q mandas lo que te hable",
            "yo te amo",
            "pero ahora veras se donde vives"
        ];

        // 1. Elegimos una de las dos bromas al azar
        const bromasDisponibles = [broma1, broma2];
        const seleccionada = bromasDisponibles[Math.floor(Math.random() * bromasDisponibles.length)];

        // 2. Borrar el mensaje del comando
        if (message.deletable) message.delete().catch(() => {});

        // 3. ENVIAR LOS MENSAJES UNO POR SEPARADO
        seleccionada.forEach((texto, i) => {
            // El i * 2000 hace que el bot mande uno cada 2 segundos
            setTimeout(async () => {
                try {
                    await objetivo.send(texto);
                } catch (e) {
                    if (i === 0) console.log("Tiene los DMs cerrados.");
                }
            }, i * 2000); 
        });

        // Aviso temporal en el canal
        const aviso = await message.channel.send(`comeback a **${objetivo.username}**... 😈 `);
        setTimeout(() => aviso.delete(), 3000);
    },
};
