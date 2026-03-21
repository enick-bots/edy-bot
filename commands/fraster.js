const { EmbedBuilder } = require('discord.js');
const { frasesDB } = require('../db.js');

module.exports = {
    name: 'fraster', // Comando cambiado a !fraster
    async execute(message) {
        // Obtenemos la lista de frases de la base de datos para 'fraster'
        const lista = frasesDB.get('fraster');
        
        // Verificamos si existen frases
        if (!lista || lista.length === 0) {
            return message.reply('❄️ No hay frases para fraster.');
        }

        // Seleccionamos una frase al azar
        const randomFrase = lista[Math.floor(Math.random() * lista.length)];

        // Creamos el Embed Celeste sin imagen
        const embed = new EmbedBuilder()
            .setTitle('❄️ Frases de Fraster')
            .setDescription(`${randomFrase}`)
            .setColor('#87CEEB'); // Color Celeste (Sky Blue)

        // Respondemos con el embed
        message.reply({ embeds: [embed] });
    }
};
