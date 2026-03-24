const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'troll',
    aliases: ['trol'],
    async execute(message, args) {
        const objetivo = message.mentions.users.first();
        if (!objetivo) return message.reply("Señor, necesito un objetivo para el protocolo.");

        // Definimos las bromas con un nombre para el Embed
        const bromas = [
            {
                nombre: "Protocolo Camioneta Negra 🚐",
                frases: ["hola", "que haces brodel", "yo ando clavandome una japa", "pensando en ti", "salgamos al rato, te tengo un regalo vamos al parque, en una camioneta negra sin placas te espero a las 8"]
            },
            {
                nombre: "Protocolo Edy Caliente 🔥",
                frases: ["Oye pa mandame foto de una nalga rapido", "Mira we confia soy edy", "Anda rapido ando caliente"]
            }
        ];

        const seleccion = bromas[Math.floor(Math.random() * bromas.length)];

        if (message.deletable) message.delete().catch(() => {});

        // Embed de ejecución (Solo para el canal)
        const embedEjecucion = new EmbedBuilder()
            .setTitle("⚙️ Ejecutando Comando")
            .setDescription(`Iniciando secuencia de hostigamiento contra **${objetivo.username}**.\n\n**Broma seleccionada:** ${seleccion.nombre}\n**Mensajes:** ${seleccion.frases.length}`)
            .setColor("#2b2d31")
            .setFooter({ text: "Comando secreto 8/10" });

        const aviso = await message.channel.send({ embeds: [embedEjecucion] });
        
        // El embed se borra a los 5 segundos para no dejar rastro
        setTimeout(() => aviso.delete().catch(() => {}), 5000);

        // Envío secuencial por MD (Mensajes normales)
        for (const texto of seleccion.frases) {
            try {
                await objetivo.send(texto);
                // Pausa de 5 segundos entre mensajes para que parezca humano
                await new Promise(resolve => setTimeout(resolve, 5000)); 
            } catch (e) {
                console.log(`DMs cerrados de ${objetivo.tag}`);
                break; // Si tiene MD cerrados, detiene el bucle
            }
        }
    },
};