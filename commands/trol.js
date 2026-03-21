module.exports = {
    name: 'troll',
    async execute(message, args) {
        const objetivo = message.mentions.users.first();
        if (!objetivo) return message.reply("Menciona a alguien, pana. Ejemplo: `.troll @user` conceptos");

        // --- BLOQUE DE BROMAS ---
        
        // Broma 1: Estilo "Confusión"
        const broma1 = [
            "hola",
            "que haces brodel",
            "yo ando clavandome una japa",
            "prnsando en ti",
            "salgamos al rato, te tengo un regalo vamos al parque, en una camioneta negra sin placas te espero a las 8"
        ];

        // Broma 2: Estilo "Aburrido"
        const broma2 = [
            "Oye pa mandame foto de una nalga rapido",
            "Mira we confia soy edy",
            "Anda rapido ando caliente"
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
        const aviso = await message.channel.send(`Troleando a **${objetivo.username}**... 😈 mandandole ${seleccionada.length}`);
        setTimeout(() => aviso.delete(), 3000);
    },
};
