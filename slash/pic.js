const { SlashCommandBuilder } = require('discord.js');
const db = require('../db.js'); // Importamos todo el objeto db

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pic')
        .setDescription('Agrega una nueva imagen')
        .addStringOption(opt => 
            opt.setName('category')
            .setDescription('Categoria de la foto')
            .setRequired(true)
            .addChoices(
                { name: 'Goat', value: 'goat' },
                { name: 'Bad', value: 'bad' },
                { name: 'Meme', value: 'meme' }
            ))
        .addAttachmentOption(opt => opt.setName('image').setDescription('Sube la imagen').setRequired(true)),
    async execute(interaction) {
        const cat = interaction.options.getString('category');
        const img = interaction.options.getAttachment('image');
        
        // Usamos db.picsDB en lugar de solo picsDB
        if (!db.picsDB[cat]) db.picsDB[cat] = [];
        db.picsDB[cat].push(img.url);
        
        // ESTA ES LA LINEA: guarda el cambio en el archivo JSON
        db.saveAll();
        
        const prefix = cat === 'goat' ? 'pg' : cat === 'bad' ? 'pb' : 'pr';
        const index = db.picsDB[cat].length;

        await interaction.reply({ content: `⚙️ imagen registrada como ${prefix}.${index}`, ephemeral: true });
    }
};
