const { EmbedBuilder } = require('discord.js');
const { frasesDB } = require('../db.js');

module.exports = {
    name: 'edy',
    async execute(message) {
        // Obtenemos la lista de frases de la base de datos (cambiado a 'edy')
        const lista = frasesDB.get('edy');
        
        // Verificamos si existen frases
        if (!lista || lista.length === 0) {
            return message.reply('🥥 No hay frases para edy.');
        }

        // Seleccionamos una frase al azar
        const randomFrase = lista[Math.floor(Math.random() * lista.length)];

        // Creamos el Embed Azul
        const embed = new EmbedBuilder()
            .setTitle('🥥 Frases de edy')
            .setDescription(`${randomFrase}`)
            .setColor('#0099ff') // Color Azul
            .setImage('https://cdn.discordapp.com/attachments/1477488189529788538/1480988222577180943/Screenshot_20260223-171845_TikTok_Lite.png?ex=69bf8503&is=69be3383&hm=9122ead7c28d159ae95966b2491a520982c20b888f3b6826c50897163a636f72&');

        // Respondemos con el embed
        message.reply({ embeds: [embed] });
    }
};
