const { EmbedBuilder } = require('discord.js');
const { frasesDB } = require('../db.js');

module.exports = {
    name: 'kiqbo',
    async execute(message) {
        // Obtenemos la lista de frases de la base de datos
        const lista = frasesDB.get('kiqbo');
        
        // Verificamos si existen frases
        if (!lista || lista.length === 0) {
            return message.reply(' No hay frases para kiqbo.');
        }

        // Seleccionamos una frase al azar
        const randomFrase = lista[Math.floor(Math.random() * lista.length)];

        // Creamos el Embed Azul
        const embed = new EmbedBuilder()
            .setTitle('🗿 Frases de kiqbo')
            .setDescription(`${randomFrase}`)
            .setColor('#0099ff') // Color Azul
            .setImage('https://cdn.discordapp.com/attachments/1476674609666592808/1480640820553191646/image0.jpg?ex=69bd98b8&is=69bc4738&hm=483e2c07a4865d68b9113680c350324defa59f6e93a007bae972c86d017181f7&'); // Espacio para URL (puse la de atrocidad como ejemplo)

        // Respondemos con el embed
        message.reply({ embeds: [embed] });
    }
};
