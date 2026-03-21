const { EmbedBuilder } = require('discord.js');
const { frasesDB } = require('../db.js');

module.exports = {
    name: 'gustambo', // Comando cambiado a !gustambo
    async execute(message) {
        // Obtenemos la lista de frases de la base de datos para 'gustambo'
        const lista = frasesDB.get('gustambo');
        
        // Verificamos si existen frases
        if (!lista || lista.length === 0) {
            return message.reply('🐀 No hay frases para gustambo.');
        }

        // Seleccionamos una frase al azar
        const randomFrase = lista[Math.floor(Math.random() * lista.length)];

        // Creamos el Embed Rojo sin imagen
        const embed = new EmbedBuilder()
            .setTitle('🐀 Frases de Gustambo')
            .setDescription(`${randomFrase}`)
            .setColor('#FF0000'); // Rojo sólido

        // Respondemos con el embed
        message.reply({ embeds: [embed] });
    }
};
