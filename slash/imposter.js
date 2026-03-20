const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');
const ImposterGame = require('./game.js');

const activeGames = new Map();

// --- BASE DE DATOS INTEGRADA ---
const gameData = {
    "Cine": [
        { palabra: "Batman", pistas: ["Capa", "Gotham", "Noche", "Murciélago"] },
        { palabra: "Shrek", pistas: ["Ogro", "Pantano", "Burro", "Verde"] },
        { palabra: "Titanic", pistas: ["Barco", "Iceberg", "Océano", "Rose"] },
        { palabra: "Spider-Man", pistas: ["Telaraña", "Rojo", "Salto", "Nueva York"] },
        { palabra: "Harry Potter", pistas: ["Mago", "Varita", "Cicatriz", "Búho"] },
        { palabra: "Star Wars", pistas: ["Sable", "Fuerza", "Espacio", "Galaxia"] },
        { palabra: "Avatar", pistas: ["Azul", "Selva", "Naturaleza", "Flecha"] },
        { palabra: "Joker", pistas: ["Risa", "Maquillaje", "Caos", "Payaso"] },
        { palabra: "Avengers", pistas: ["Equipo", "Gema", "Héroe", "Escudo"] },
        { palabra: "Toy Story", pistas: ["Juguete", "Vaquero", "Bota", "Amistad"] },
        { palabra: "Frozen", pistas: ["Nieve", "Hielo", "Princesa", "Castillo"] },
        { palabra: "Minions", pistas: ["Banana", "Amarillo", "Gafas", "Villano"] },
        { palabra: "Matrix", pistas: ["Píldora", "Código", "Simulación", "Gafas"] },
        { palabra: "Rey León", pistas: ["Sabana", "Rugido", "Selva", "Cachorro"] },
        { palabra: "Jurassic Park", pistas: ["Dinosaurio", "Isla", "Hueso", "ADN"] }
        // Agrega más aquí siguiendo este formato [{palabra, pistas}, ...]
    ],
    "Lugares": [
        { palabra: "París", pistas: ["Torre", "Francia", "Pan", "Arte"] },
        { palabra: "Egipto", pistas: ["Pirámide", "Faraón", "Desierto", "Río"] },
        { palabra: "Londres", pistas: ["Reloj", "Niebla", "Reina", "Puente"] },
        { palabra: "Japón", pistas: ["Sushi", "Anime", "Isla", "Tecnología"] },
        { palabra: "Roma", pistas: ["Coliseo", "Pizza", "Historia", "Gladiador"] },
        { palabra: "Nueva York", pistas: ["Estatua", "Rascacielos", "Taxi", "Manzana"] },
        { palabra: "Brasil", pistas: ["Fútbol", "Selva", "Carnaval", "Playa"] },
        { palabra: "China", pistas: ["Muralla", "Dragón", "Arroz", "Panda"] },
        { palabra: "México", pistas: ["Taco", "Sombrero", "Mariachi", "Picante"] },
        { palabra: "Australia", pistas: ["Canguro", "Isla", "Desierto", "Ópera"] }
    ],
    "Comida": [
        { palabra: "Pizza", pistas: ["Masa", "Queso", "Horno", "Italia"] },
        { palabra: "Hamburguesa", pistas: ["Carne", "Pan", "Ketchup", "Papas"] },
        { palabra: "Sushi", pistas: ["Arroz", "Pescado", "Palillos", "Alga"] },
        { palabra: "Taco", pistas: ["Tortilla", "Carne", "Picante", "Cebolla"] },
        { palabra: "Helado", pistas: ["Frío", "Copa", "Dulce", "Chocolate"] },
        { palabra: "Pasta", pistas: ["Tenedor", "Salsa", "Trigo", "Agua"] },
        { palabra: "Chocolate", pistas: ["Dulce", "Marrón", "Leche", "Cacao"] },
        { palabra: "Donas", pistas: ["Agujero", "Dulce", "Glaseado", "Caja"] },
        { palabra: "Café", pistas: ["Grano", "Taza", "Negro", "Energía"] },
        { palabra: "Paella", pistas: ["Arroz", "Sartén", "Marisco", "España"] }
    ],
    "Animales": [
        { palabra: "Perro", pistas: ["Ladrido", "Hueso", "Leal", "Caminar"] },
        { palabra: "Gato", pistas: ["Maullido", "Ratón", "Leche", "Dormir"] },
        { palabra: "Elefante", pistas: ["Trompa", "Grande", "Gris", "Orejas"] },
        { palabra: "León", pistas: ["Melena", "Rey", "Rugido", "Selva"] },
        { palabra: "Tiburón", pistas: ["Dientes", "Aleta", "Mar", "Peligro"] },
        { palabra: "Mono", pistas: ["Banana", "Árbol", "Gracioso", "Pelaje"] },
        { palabra: "Delfín", pistas: ["Agua", "Inteligente", "Salto", "Océano"] },
        { palabra: "Pingüino", pistas: ["Frío", "Hielo", "Vuelo", "Pájaro"] },
        { palabra: "Jirafa", pistas: ["Cuello", "Alto", "Manchas", "Hojas"] },
        { palabra: "Lobo", pistas: ["Luna", "Manada", "Aullido", "Bosque"] }
    ]
};

module.exports = {
    activeGames, 
    data: new SlashCommandBuilder()
        .setName('imposter')
        .setDescription('🕵️ Inicia el juego del impostor')
        .addIntegerOption(option => 
            option.setName('players').setDescription('Jugadores (4-15)').setRequired(true).setMinValue(4).setMaxValue(15))
        .addIntegerOption(option => 
            option.setName('imposter').setDescription('Impostores (1-4)').setRequired(true).setMinValue(1).setMaxValue(4))
        .addStringOption(option => 
            option.setName('tema').setDescription('Elige la categoría').setRequired(true)
                .addChoices(
                    { name: '🎬 Cine', value: 'Cine' },
                    { name: '🍕 Comida', value: 'Comida' },
                    { name: '🌍 Lugares', value: 'Lugares' },
                    { name: '🐾 Animales', value: 'Animales' }
                ))
        .addStringOption(option => 
            option.setName('pistas').setDescription('¿Activar pistas?').setRequired(true)
                .addChoices({ name: '✅ On', value: 'on' }, { name: '❌ Off', value: 'off' })),

    async execute(interaction) {
        const maxP = interaction.options.getInteger('players');
        const numI = interaction.options.getInteger('imposter');
        const tema = interaction.options.getString('tema');
        const usePistas = interaction.options.getString('pistas') === 'on';

        const temaEmojis = { 'Cine': '🎬', 'Comida': '🍕', 'Lugares': '🌍', 'Animales': '🐾' };
        const emojiTema = temaEmojis[tema] || '📌';

        const game = new ImposterGame(interaction.user, maxP, numI, usePistas);
        activeGames.set(interaction.channelId, game);

        const updateEmbed = () => {
            return new EmbedBuilder()
                .setTitle("🕵️ MISTERIO: ¿QUIÉN ES EL IMPOSTOR?")
                .setColor(0x2b2d31)
                .addFields(
                    { name: `${emojiTema} Categoría Seleccionada`, value: `**${tema.toUpperCase()}**`, inline: false },
                    { name: "👥 Sala", value: `👤 ${game.players.length}/${game.maxPlayers}`, inline: true },
                    { name: "👺 Impostores", value: `💀 ${game.numImposters}`, inline: true },
                    { name: "💡 Pistas", value: game.usePistas ? "✅ Activadas" : "❌ Desactivadas", inline: true },
                    { name: "🎮 Jugadores en lista", value: game.players.map(p => `• <@${p.id}>`).join('\n') || "Esperando..." },
                    { name: "👑 Anfitrión", value: `<@${game.host.id}>` }
                )
                .setFooter({ text: "Haz clic en Unirse para participar" });
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join').setLabel('Unirse').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('start').setLabel('Empezar').setEmoji('🚀').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cancel').setLabel('Cancelar').setEmoji('🛑').setStyle(ButtonStyle.Danger)
        );

        const response = await interaction.reply({ embeds: [updateEmbed()], components: [row] });
        const msg = await interaction.fetchReply();

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

        collector.on('collect', async i => {
            if (i.customId === 'join') {
                const status = game.addPlayer(i.user);
                if (status === 'ok') {
                    await i.update({ embeds: [updateEmbed()] });
                } else {
                    await i.reply({ content: `⚠️ ${status}`, flags: [MessageFlags.Ephemeral] });
                }
            }

            if (i.customId === 'start') {
                if (i.user.id !== game.host.id) return i.reply({ content: "❌ Solo el host puede iniciar.", flags: [MessageFlags.Ephemeral] });
                if (game.players.length < 4) return i.reply({ content: "⚠️ Necesitas al menos 4 jugadores.", flags: [MessageFlags.Ephemeral] });

                // SELECCIÓN LÓGICA POR TEMA
                const palabrasDelTema = gameData[tema];
                const dataSeleccionada = palabrasDelTema[Math.floor(Math.random() * palabrasDelTema.length)];
                
                if (!dataSeleccionada) return i.reply({ content: "❌ Error: No hay datos para este tema.", flags: [MessageFlags.Ephemeral] });

                await i.deferUpdate();

                game.word = dataSeleccionada.palabra;
                game.started = true;
                
                const shuffled = [...game.players].sort(() => 0.5 - Math.random());
                const impostores = shuffled.slice(0, game.numImposters);
                game.imposterIds = impostores.map(imp => imp.id);

                const sendDMs = game.players.map(async (p) => {
                    const esImpostor = game.imposterIds.includes(p.id);
                    const embed = new EmbedBuilder()
                        .setTitle(esImpostor ? "🟥 ERES EL IMPOSTOR" : "🟦 ERES TRIPULANTE")
                        .setColor(esImpostor ? 0xff0000 : 0x00aaff);

                    if (esImpostor) {
                        const randomPista = dataSeleccionada.pistas[Math.floor(Math.random() * dataSeleccionada.pistas.length)];
                        const pstr = game.usePistas ? randomPista : "Desactivadas";
                        embed.setDescription(`🤫 **Tu objetivo:** No dejes que te descubran.\n\n🔎 **Tu pista es:** \`${pstr}\``);
                    } else {
                        embed.setDescription(`✅ **Tu objetivo:** Encuentra al impostor.\n\n🔑 **La palabra secreta es:** \`${game.word}\``);
                    }
                    
                    return p.send({ embeds: [embed] }).catch(() => null);
                });

                await Promise.all(sendDMs);

                await i.editReply({ 
                    content: `🎮 **¡QUE COMIENCE EL JUEGO!**\nTema: **${tema}** ${emojiTema}\nTodos han recibido su rol por Mensaje Directo 📩`, 
                    components: [], 
                    embeds: [] 
                });
                collector.stop();
            }

            if (i.customId === 'cancel') {
                if (i.user.id !== game.host.id) return i.reply({ content: "❌ Solo el host.", flags: [MessageFlags.Ephemeral] });
                activeGames.delete(interaction.channelId);
                await i.update({ content: "🛑 **Partida cancelada por el anfitrión.**", components: [], embeds: [] });
                collector.stop();
            }
        });
    }
};
