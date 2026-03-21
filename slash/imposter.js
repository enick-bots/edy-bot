const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');
const ImposterGame = require('./game.js');

const activeGames = new Map();

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
,
"Brawl": [
// Inicial
{ palabra: "Shelly", pistas: ["Bandolera", "Perdigones", "Retroceso", "Primeriza"] },
//Especiales
{ palabra: "Nita", pistas: ["Chamán", "Onda sísmica", "Espíritu", "Zarpazos"] },
{ palabra: "Colt", pistas: ["Sheriff", "Tupé", "Espejo", "Revólveres"] },
{ palabra: "Bull", pistas: ["Anillo nasal", "Arbustos", "Embestida", "Toro"] },
{ palabra: "Brock", pistas: ["Gafas de sol", "Danza", "Boombox", "Chocolatito"] },
{ palabra: "El Primo", pistas: ["Lucha libre", "Cinturón", "Meteorito", "Suplex"] },
{ palabra: "Barley", pistas: ["Mezcla", "Corrosivo", "Servicio", "Cristalería"] },
{ palabra: "Poco", pistas: ["Mariachi", "Serenata", "Acorde", "Calavera"] },
{ palabra: "Rosa", pistas: ["Fotosíntesis", "Biodiversidad", "Botánica", "Espinas"] },
//Superespeciales
{ palabra: "Jessie", pistas: ["Mochila", "Chatarrera", "Electricidad", "Energía"] },
{ palabra: "Dynamike", pistas: ["Mecha", "Explosivos", "Canario", "Minería"] },
{ palabra: "Tick", pistas: ["Cuerda", "Autónomo", "Minas", "Lanzamiento"] },
{ palabra: "Rico", pistas: ["Ángulos", "Chicles", "Multiball", "Rebotes"] },
{ palabra: "Darryl", pistas: ["Barril", "Rodamiento", "Sombrero pirata", "Acero"] },
{ palabra: "Penny", pistas: ["Bucanera", "Saco de oro", "Mortero", "Cañonazo"] },
{ palabra: "Carl", pistas: ["Geólogo", "Eje", "Geoda", "Pico"] },
{ palabra: "Jacky", pistas: ["Vibración", "Martilleo", "Grosera", "Succión"] },
{ palabra: "Gus", pistas: ["Solitario", "Almas", "Globos", "Fantasmagórico"] },
//Épicos
{ palabra: "Bo", pistas: ["Sabiduría", "Tótem", "Águila", "Flechas"] },
{ palabra: "Piper", pistas: ["Francotiradora", "Vuelo", "Paraguas", "Bombas"] },
{ palabra: "Pam", pistas: ["Muelle", "Tuercas", "Chatarra", "Torreta"] },
{ palabra: "Frank", pistas: ["Inmóvil", "Stun", "DJ", "Martillo"] },
{ palabra: "Bibi", pistas: ["Burbuja", "Home run", "Bate", "Chicle"] },
{ palabra: "Bea", pistas: ["Colmena", "Aguijón", "Polen", "Miel"] },
{ palabra: "Emz", pistas: ["Vendas", "Influencer", "Spray", "Laca"] },
{ palabra: "Gale", pistas: ["Turbulencia", "Anciano", "Nieve", "Soplador"] },
{ palabra: "Nani", pistas: ["Triángulo", "Óptica", "Control", "Lente"] },
{ palabra: "Colette", pistas: ["Porcentaje", "Diario", "Colección", "Impuestos"] },
{ palabra: "Edgar", pistas: ["Parkour", "Salto", "Bufanda", "Pulgar abajo"] },
{ palabra: "Stu", pistas: ["Neumático", "Fuego", "Gasolina", "Acróbata"] },
{ palabra: "Belle", pistas: ["Cadena", "Trampa", "Brazo de oro", "Marcado"] },
{ palabra: "Grom", pistas: ["Cruz", "Castillo", "Walkie-talkie", "Explosión"] },
{ palabra: "Griff", pistas: ["Rebajas", "Propinas", "Caja registradora", "Dinero"] },
{ palabra: "Ash", pistas: ["Furia", "Escoba", "Ratones", "Contenedor"] },
{ palabra: "Lola", pistas: ["Bufanda de zorro", "Actriz", "Ego", "Doble"] },
{ palabra: "Bonnie", pistas: ["Dientes", "Circo", "Cañón", "Casco"] },
{ palabra: "Sam", pistas: ["Recuperación", "Venganza", "Nudilleras", "Fábrica"] },
{ palabra: "Mandy", pistas: ["Cetro", "Rayo de dulce", "Caramelos", "Monarca"] },
{ palabra: "Maisie", pistas: ["Onda expansiva", "Extintor", "Seguridad", "Brazo mecánico"] },
{ palabra: "Hank", pistas: ["Submarino", "Camarón", "Burbuja de jabón", "Tanque"] },
{ palabra: "Pearl", pistas: ["Vapor", "Cookies", "Horno", "Calor"] },
{ palabra: "Larry y Lawrie", pistas: ["Protocolo", "Dúo", "Ticket", "Policía"] },
{ palabra: "Angelo", pistas: ["Pantano", "Aguijoneo", "Mosquito", "Veneno"] },
{ palabra: "Berry", pistas: ["Curación", "Lácteo", "Unicornio", "Helado"] },
{ palabra: "Shade", pistas: ["Oscuridad", "Abrazo", "Sombra", "Traspaso"] },
{ palabra: "Meeple", pistas: ["Azar", "Pieza de juego", "Dados", "Tablero"] },
{ palabra: "Trunk", pistas: ["Hidrante", "Trompa", "Agua", "Pesado"] },
//Míticos
{ palabra: "Mortis", pistas: ["Enterrador", "Dash", "Pala", "Murciélagos"] },
{ palabra: "Tara", pistas: ["Agujero negro", "Mística", "Cartas", "Sombras"] },
{ palabra: "Genio", pistas: ["Humo", "Deseos", "Lámpara", "Mano mágica"] },
{ palabra: "Señor P", pistas: ["Equipaje", "Botones", "Maletas", "Pingüinos"] },
{ palabra: "Max", pistas: ["Resistencia", "Rayo", "Energética", "Velocidad"] },
{ palabra: "Sprout", pistas: ["Muro vegetal", "Robot", "Semilla", "Naturaleza"] },
{ palabra: "Byron", pistas: ["Vendedor", "Suero", "Vial", "Culebra"] },
{ palabra: "Squeak", pistas: ["Adhesivo", "Baba", "Baboso", "Explosión azul"] },
{ palabra: "Lou", pistas: ["Granizado", "Congelación", "Hielo", "Jarabe"] },
{ palabra: "Ruffs", pistas: ["Coronel", "Láser", "Suministros", "Rebote"] },
{ palabra: "Buzz", pistas: ["Boyas", "Dinosaurio", "Silbato", "Salvavidas"] },
{ palabra: "Fang", pistas: ["Cine", "Palomitas", "Zapatilla", "Patada"] },
{ palabra: "Eve", pistas: ["Invasión", "Nave", "Pulga", "Huevos"] },
{ palabra: "Janet", pistas: ["Estrella aérea", "Cantante", "Vuelo", "Micrófono"] },
{ palabra: "Otis", pistas: ["Silenciador", "Grafiti", "Pintura", "Cil"] },
{ palabra: "Buster", pistas: ["Pantalla", "Luz", "Proyector", "Escudo"] },
{ palabra: "Gray", pistas: ["Bastón", "Dedo", "Portales", "Mimo"] },
{ palabra: "R-T", pistas: ["Datos", "Vigilancia", "Cámaras", "División"] },
{ palabra: "Willow", pistas: ["Farol", "Linterna", "Control mental", "Peces"] },
{ palabra: "Doug", pistas: ["Flotador", "Piscina", "Salchicha", "Resurrección"] },
{ palabra: "Chuck", pistas: ["Vías", "Locomotora", "Postes", "Vapor"] },
{ palabra: "Charlie", pistas: ["Capullo", "Araña", "Yo-yo", "Circo"] },
{ palabra: "Mico", pistas: ["Estudio", "Salto", "Mono", "Micrófono"] },
{ palabra: "Melodie", pistas: ["Karaoke", "Notas musicales", "Dash triple", "K-pop"] },
{ palabra: "Lily", pistas: ["Teletransporte", "Dagas", "Espinas", "Asesina"] },
{ palabra: "Clancy", pistas: ["Evolución", "Langosta", "Rangos", "Metralleta"] },
{ palabra: "Moe", pistas: ["Subterráneo", "Ciego", "Taladro", "Rata"] },
{ palabra: "Juju", pistas: ["Tienda de curiosidades", "Elementos", "Muñeca", "Vudú"] },
{ palabra: "Ollie", pistas: ["Truco", "Ruedas", "Skate", "Patineta"] },
{ palabra: "Lumi", pistas: ["Cegador", "Luz", "Flash", "Brillo"] },
{ palabra: "Finx", pistas: ["Bosque", "Astucia", "Zorro", "Trampa"] },
{ palabra: "Jae-Yong", pistas: ["Código", "Tecnología", "Hacker", "Red"] },
{ palabra: "Alli", pistas: ["Escamas", "Río", "Caimán", "Mandíbula"] },
{ palabra: "Mina", pistas: ["Túnel", "Excavación", "Detonador", "Mecha"] },
{ palabra: "Ziggy", pistas: ["Energía", "Chispa", "Rayo", "Voltaje"] },
{ palabra: "Gigi", pistas: ["Alfiler", "Costura", "Hilos", "Agujas"] },
{ palabra: "Glowbert", pistas: ["Brillo verde", "Lodo", "Moco", "División masiva"] },
{ palabra: "Najia", pistas: ["Veneno apilable", "Serpiente de papel", "Jarrones", "FX"] },
// Legendarios
{ palabra: "Spike", pistas: ["Curva", "Sin voz", "Cactus", "Pinchos"] },
{ palabra: "Crow", pistas: ["Plumaje", "Cuervo", "Veneno letal", "Dagas"] },
{ palabra: "Leon", pistas: ["Shurikens", "Piruleta", "Sigilo", "Invisibilidad"] },
{ palabra: "Sandy", pistas: ["Guijarros", "Dormilón", "Arena", "Sueño"] },
{ palabra: "Surge", pistas: ["Protector", "Mejora", "Evolución", "Bebida"] },
{ palabra: "Amber", pistas: ["Aceite", "Antorcha", "Llamarada", "Fuego"] },
{ palabra: "Meg", pistas: ["Máquina", "Robot", "Meca", "Reparación"] },
{ palabra: "Chester", pistas: ["Bufón", "Sorpresa", "Cascabeles", "Azar total"] },
{ palabra: "Cordelius", pistas: ["Silencio", "Reino de sombras", "Hongos", "Seta"] },
{ palabra: "Kit", pistas: ["Ronroneo", "Salto aliado", "Collar", "Garras"] },
{ palabra: "Draco", pistas: ["Metal", "Guitarra", "Dragón", "Fuego continuo"] },
{ palabra: "Kenji", pistas: ["Chef", "Corte", "Sushi", "Samurái"] },
{ palabra: "Pierce", pistas: ["Perforación", "Impacto", "Dardo", "Precisión"] },
// Ultra Legendarios
{ palabra: "Kaze", pistas: ["Ráfaga", "Abanico", "Tornado", "Viento"] },
{ palabra: "Sirius", pistas: ["Absorción", "Galaxia", "Gravedad", "Agujero negro"] }
]

};

module.exports = {
    activeGames,
    data: new SlashCommandBuilder()
        .setName('imposter')
        .setDescription('🕵️ Inicia el juego del impostor')
        .addIntegerOption(o => o.setName('players').setDescription('Jugadores (3-15)').setRequired(true).setMinValue(3).setMaxValue(15))
        .addIntegerOption(o => o.setName('imposter').setDescription('Impostores (1-4)').setRequired(true).setMinValue(1).setMaxValue(4))
        .addStringOption(o => o.setName('tema').setDescription('Categoría').setRequired(true)
            .addChoices({ name: '🎬 Cine', value: 'Cine' }, { name: '🍕 Comida', value: 'Comida' }, { name: '🌍 Lugares', value: 'Lugares' }, { name: '🐾 Animales', value: 'Animales' }, { name: "🎮 Brawl Stars", value: "Brawl"}))
        .addStringOption(o => o.setName('pistas').setDescription('¿Pistas?').setRequired(true)
            .addChoices({ name: '✅ On', value: 'on' }, { name: '❌ Off', value: 'off' })),

    async execute(interaction) {
        const maxP = interaction.options.getInteger('players');
        const numI = interaction.options.getInteger('imposter');
        const tema = interaction.options.getString('tema');
        const usePistas = interaction.options.getString('pistas') === 'on';

        const game = new ImposterGame(interaction.user, maxP, numI, usePistas);
        activeGames.set(interaction.channelId, game);

        const updateEmbed = () => {
            return new EmbedBuilder()
                .setTitle("🕵️ MISTERIO: ¿QUIÉN ES EL IMPOSTOR?")
                .setColor(0x2b2d31)
                .addFields(
                    { name: `📌 Categoría`, value: `**${tema.toUpperCase()}**`, inline: false },
                    { name: "👥 Sala", value: `👤 ${game.players.length}/${game.maxPlayers}`, inline: true },
                    { name: "👑 Anfitrión", value: `<@${game.host.id}>`, inline: true },
                    { name: "🎮 Jugadores", value: game.players.map(p => `• <@${p.id}>`).join('\n') || "Esperando..." }
                );
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join').setLabel('Unirse').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('start').setLabel('Empezar').setEmoji('🚀').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cancel').setLabel('Cancelar').setEmoji('🛑').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [updateEmbed()], components: [row] });
        const msg = await interaction.fetchReply();

        const buttonCollector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });
        const textCollector = interaction.channel.createMessageCollector({ filter: m => m.content.startsWith('.') && !m.author.bot });

        textCollector.on('collect', async m => {
            const currentGame = activeGames.get(interaction.channelId);
            if (!currentGame) return;

            if (m.content.startsWith('.kick')) {
                if (m.author.id !== currentGame.host.id) return;
                const target = m.mentions.users.first();
                if (target) {
                    currentGame.players = currentGame.players.filter(p => p.id !== target.id);
                    if (currentGame.bannedIds) currentGame.bannedIds.push(target.id); 
                    const kEmbed = new EmbedBuilder().setDescription(`👞 **${target.username}** expulsado.`).setColor(0xffa500);
                    await m.reply({ embeds: [kEmbed] });
                    await interaction.editReply({ embeds: [updateEmbed()] });
                }
            }

            if (m.content === '.stop') {
                if (m.author.id !== currentGame.host.id) return;
                const stopConfirm = new EmbedBuilder()
                    .setTitle("🛑 ¿DETENER PARTIDA?")
                    .setDescription("Confirma si deseas cerrar la sala.")
                    .setColor(0xff0000)
                    .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa21wMmRmdGJuMnJ0dGhxZThtbzlyNWsyeDdrcnNvYWszamR1Ym83YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/gXEguRNQJyQEUgYHRO/giphy.gif');

                const stopRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('confirm_stop').setLabel('Sí, detener').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('cancel_stop').setLabel('No, seguir').setStyle(ButtonStyle.Secondary)
                );

                const sMsg = await m.reply({ embeds: [stopConfirm], components: [stopRow] });
                const sColl = sMsg.createMessageComponentCollector({ filter: i => i.user.id === currentGame.host.id, time: 15000 });

                sColl.on('collect', async i => {
                    if (i.customId === 'confirm_stop') {
                        activeGames.delete(interaction.channelId);
                        textCollector.stop();
                        buttonCollector.stop();
                        await i.update({ embeds: [new EmbedBuilder().setDescription("🛑 Partida finalizada.").setColor(0x000000)], components: [] });
                    } else {
                        await i.update({ embeds: [new EmbedBuilder().setDescription("🎮 Juego reanudado.").setColor(0x00ff00)], components: [] });
                    }
                });
            }

            if (m.content === '.r') {
                if (m.author.id !== currentGame.host.id || !currentGame.started) return;
                const rEmbed = new EmbedBuilder()
                    .setTitle("🕵️ REVELACIÓN")
                    .setColor(0x00ff00)
                    .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXVsa3hhanJ4OTg4NWZzaWxseHYyMDF4ZjdqdDJhM2g2cnI0cnZsOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dgEtXsuqq2PL2/giphy.gif')
                    .addFields({ name: "👺 Impostores", value: currentGame.imposterIds.map(id => `• <@${id}>`).join('\n') }, { name: "🔑 Palabra", value: `**${currentGame.word}**` });

                await m.reply({ embeds: [rEmbed] });
                activeGames.delete(interaction.channelId);
                textCollector.stop();
                buttonCollector.stop();
            }
        });

        buttonCollector.on('collect', async i => {
            try {
                if (i.customId === 'join') {
                    const status = game.addPlayer(i.user);
                    if (status === 'ok') await i.update({ embeds: [updateEmbed()] });
                    else await i.reply({ content: `⚠️ ${status}`, flags: [MessageFlags.Ephemeral] });
                }

                                if (i.customId === 'start') {
                    if (i.user.id !== game.host.id) return i.reply({ content: "❌ Solo el host puede iniciar.", flags: [MessageFlags.Ephemeral] });
                    if (game.players.length < 3) return i.reply({ content: "⚠️ Mínimo 3 jugadores.", flags: [MessageFlags.Ephemeral] });

                    const lista = gameData[tema];
                    const data = lista[Math.floor(Math.random() * lista.length)];
                    game.word = data.palabra;
                    game.started = true;

                    // MEZCLA ALEATORIA REAL (Algoritmo Fisher-Yates simple)
                    const shuffled = [...game.players].sort(() => Math.random() - 0.5);
                    game.imposterIds = shuffled.slice(0, game.numImposters).map(p => p.id);

                    await Promise.all(game.players.map(p => {
                        const esI = game.imposterIds.includes(p.id);
                        
                        // DISEÑO PARA IMPOSTOR
                        if (esI) {
                            const embedImpostor = new EmbedBuilder()
                                .setTitle("🟥 ¡ERES EL IMPOSTOR!")
                                .setColor(0xff0000)
                                .setDescription(`🤫 **Tu misión:** Pasa desapercibido y confunde a los demás.\n\n📌 **Pista:** \`${game.usePistas ? data.pistas[Math.floor(Math.random() * data.pistas.length)] : 'Desactivadas'}\``)
                                .setThumbnail('https://media.giphy.com') // Gif de impostor/shhh
                                .setFooter({ text: "No reveles tu identidad" });
                            return p.send({ embeds: [embedImpostor] }).catch(() => null);
                        } 
                        
                        // DISEÑO PARA TRIPULANTE
                        else {
                            const embedTripulante = new EmbedBuilder()
                                .setTitle("🟦 ¡ERES TRIPULANTE!")
                                .setColor(0x00aaff)
                                .setDescription(`🕵️ **Tu misión:** Encuentra al impostor.\n\n🔑 **Palabra secreta:** \`${game.word}\`\n\n no seas down y lo cagues pndj`)
                                .setThumbnail('https://media.giphy.com') // Gif de detective/lupa
                                .setFooter({ text: "Usa la palabra con cuidado" });
                            return p.send({ embeds: [embedTripulante] }).catch(() => null);
                        }
                    }));

                    const startE = new EmbedBuilder()
                        .setTitle("🎮 ¡PARTIDA INICIADA!")
                        .setDescription(`El juego ha comenzado con **${game.players.length}** jugadores.\n\nCategoría: **${tema}**\n\n📢 **¡Revisen sus MD!** Los roles han sido enviados.`)
                        .setImage('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjB6dmFhZnZmM2loemZrM21xMHBzc2VudTlhb3Z3ejRocmpzNWd3cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xpI9kszfSCMQAr4wmS/giphy.gif')
                        .setColor(0x5865f2);
                    
                    await i.update({ embeds: [startE], components: [] });
                }

                if (i.customId === 'cancel') {
                    if (i.user.id !== game.host.id) return i.reply({ content: "Solo el host puede cancelar.", flags: [MessageFlags.Ephemeral] });
                    activeGames.delete(interaction.channelId);
                    textCollector.stop();
                    buttonCollector.stop();
                    
                    const cE = new EmbedBuilder()
                        .setTitle("🛑 PARTIDA CANCELADA")
                        .setDescription("El anfitrión ha cerrado la sala.")
                        .setColor(0xff0000)
                        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHRyc3IxY3o4cGlvbzZ4Y3ppa3V5cDQ3eThyeWVvMDM2bXJxMHc3MCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/WrgAGkGrh0MD1Z2gkO/giphy.gif');
                    
                    await i.update({ embeds: [cE], components: [] });
                }
             } catch (err) { 
                console.error("Error en botón:", err); 
            }
        }); // Cierre del buttonCollector
    } // Cierre del async execute
};