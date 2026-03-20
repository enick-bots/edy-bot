const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ahorcado')
        .setDescription('🪢 Adivina la palabra oculta (x2.5)')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta (10-500) o 0 para gratis').setMinValue(0).setMaxValue(500).setRequired(true)),

    async execute(interaction, user, db) {
        const amount = interaction.options.getInteger('amount') || 0;
        const esGratis = amount === 0;

        if (!esGratis && user.coins < amount) {
            return interaction.reply({ content: `No tienes suficientes ${db.emoji}. Saldo: ${user.coins}`, flags: [MessageFlags.Ephemeral] });
        }

        // --- CONFIGURACIÓN DEL JUEGO ---
        const palabras = [
    // --- NATURALEZA Y ESPACIO ---
    'UNIVERSO', 'GALAXIA', 'PLANETA', 'ESTRELLA', 'COMETA', 'NEBULOSA', 'ECLIPSE', 'METEORO', 'ORBITA', 'COSMOS',
    'CASCADA', 'BOSQUES', 'DESIERTO', 'MONTAÑA', 'OCEANO', 'VOLCAN', 'SELVA', 'GLACIAR', 'PRADERA', 'PANTANO',
    'TRUENO', 'RELAMPAGO', 'TORNADO', 'HURACAN', 'NEBLINA', 'AURORA', 'ARRECIFE', 'CAVERNA', 'ABISMO', 'HORIZONTE',
    
    // --- ANIMALES ---
    'TIGRE', 'LEOPARDO', 'PANTERA', 'TIBURON', 'DELFIN', 'BALLENA', 'CANGURO', 'JIRAFA', 'ELEFANTE', 'GORILA',
    'HALCON', 'AGUILA', 'CONDOR', 'AVESTRUZ', 'PINGÜINO', 'COCODRILO', 'TORTUGA', 'IGUANA', 'SERPIENTE', 'VIBORA',
    'ESCORPION', 'ARACNIDO', 'AVISPA', 'LIBELULA', 'GRILLO', 'CAMELLO', 'GUEPARDO', 'HIPOPOTAMO', 'RINOCERONTE', 'CEBRA',

    // --- OBJETOS Y TECNOLOGÍA ---
    'TECLADO', 'MONITOR', 'PANTALLA', 'PROCESADOR', 'CIRCUITO', 'ANTENA', 'SATELITE', 'COHETE', 'BRUJULA', 'RELOJ',
    'GUITARRA', 'PIANO', 'BATERIA', 'TROMPETA', 'VIOLIN', 'ALTAVOZ', 'AUDIFONOS', 'CAMARA', 'LINTERNA', 'MARTILLO',
    'TALADRO', 'BRÚJULA', 'MICROSCOPIO', 'TELESCOPIO', 'CALCULADORA', 'ESCANER', 'CONSOLA', 'INTERNET', 'SERVIDOR', 'ALGORITMO',

    // --- CONCEPTOS Y VARIOS ---
    'SILENCIO', 'DESTINO', 'AVENTURA', 'MISTERIO', 'LEYENDA', 'FANTASIA', 'HISTORIA', 'VICTORIA', 'LIBERTAD', 'JUSTICIA',
    'ENIGMA', 'ILUSION', 'ESPEJISMO', 'PROFECIA', 'FORTUNA', 'RIQUEZA', 'TESORERO', 'ALQUIMIA', 'HECHIZO', 'VAMPIRO',
    'ZOMBIE', 'ESPECTRO', 'FANTASMA', 'GUERRERO', 'SAMURAI', 'VIKINGO', 'CABALLERO', 'PIRATA', 'CORSARIO', 'BANDIDO',

    // --- ALIMENTOS ---
    'MANZANA', 'NARANJA', 'PLATANO', 'SANDIA', 'CEREZA', 'COCODRILO', 'CHOCOLATE', 'CARAMELO', 'PASTEL', 'HELADO',
    'HAMBURGUESA', 'PIZZERIA', 'ENSALADA', 'LASAÑA', 'ESPAGUETI', 'REFRESCO', 'CERVEZA', 'COCTEL', 'MANJAR', 'BANQUETE',
    
    // --- LUGARES Y ESTRUCTURAS ---
    'CASTILLO', 'FORTALEZA', 'PALACIO', 'CATEDRAL', 'MANSION', 'LABERINTO', 'SANTUARIO', 'BIBLIOTECA', 'MUSEO', 'TEATRO',
    'PUENTE', 'TÚNEL', 'PIRAMIDE', 'OBELISCO', 'ESTADIO', 'AEROPUERTO', 'PUERTO', 'ESTACION', 'COLISEO', 'ACADEMIA'
];
        const secreta = palabras[Math.floor(Math.random() * palabras.length)].toUpperCase();
        let acertadas = [];
        let erradas = [];
        let fallos = 0;
        const maxFallos = 6;

        const dibujos = [
            "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
            "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
            "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
            "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
            "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
            "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
            "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```"
        ];

        const getDisplay = () => secreta.split('').map(l => acertadas.includes(l) ? l : '_').join(' ');

        // Cobrar apuesta
        if (!esGratis) user.coins -= amount;
        db.saveAll();

        const embed = new EmbedBuilder()
            .setTitle('🪢 Ahorcado')
            .setDescription(`${dibujos[0]}\n\n**Palabra:** \`${getDisplay()}\`\n\n> Envía **una letra** en el chat para jugar.`)
            .setColor('#2b2d31')
            .setFooter({ text: `Apuesta: ${amount} ${db.emoji} | Errores: ${fallos}/${maxFallos}` });

        await interaction.reply({ embeds: [embed] });

        // Colector de mensajes para capturar las letras
        const filter = m => m.author.id === interaction.user.id && m.content.length === 1 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(m.content);
        const collector = interaction.channel.createMessageCollector({ filter, time: 120000 }); // 2 minutos

        collector.on('collect', async m => {
            const letra = m.content.toUpperCase();
            
            // Borrar letra del usuario (Estilo Nekotina)
            if (m.deletable) m.delete().catch(() => {});

            // Si ya usó la letra, no hacer nada
            if (acertadas.includes(letra) || erradas.includes(letra)) return;

            if (secreta.includes(letra)) {
                acertadas.push(letra);
            } else {
                erradas.push(letra);
                fallos++;
            }

            const progreso = getDisplay();

            // Lógica de Victoria
            if (!progreso.includes('_')) {
                collector.stop('win');
                const premio = Math.floor(amount * 2.5);
                if (!esGratis) user.coins += premio;
                db.saveAll();

                return interaction.editReply({ 
                    embeds: [new EmbedBuilder()
                        .setTitle('🏆 ¡VICTORIA!')
                        .setDescription(`${dibujos[fallos]}\n\nAdivinaste la palabra: **${secreta}**\n\nRecibes: **${premio} ${db.emoji}**`)
                        .setColor('#57F287')
                        .setFooter({ text: `Saldo actual: ${user.coins} ${db.emoji}` })] 
                });
            }

            // Lógica de Derrota
            if (fallos >= maxFallos) {
                collector.stop('lose');
                return interaction.editReply({ 
                    embeds: [new EmbedBuilder()
                        .setTitle('💀 ¡AHORCADO!')
                        .setDescription(`${dibujos[6]}\n\nPerdiste. La palabra era: **${secreta}**\n\nHas perdido tu apuesta de **${amount} ${db.emoji}**.`)
                        .setColor('#ED4245')
                        .setFooter({ text: `Saldo actual: ${user.coins} ${db.emoji}` })] 
                });
            }

            // Actualizar el mensaje con el nuevo estado
            await interaction.editReply({ 
                embeds: [new EmbedBuilder()
                    .setTitle('🪢 Ahorcado')
                    .setDescription(`${dibujos[fallos]}\n\n**Palabra:** \`${progreso}\`\n\n**Letras erradas:** ${erradas.join(', ') || 'Ninguna'}`)
                    .setColor('#2b2d31')
                    .setFooter({ text: `Apuesta: ${amount} ${db.emoji} | Errores: ${fallos}/${maxFallos}` })]
            });
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.editReply({ content: `⏰ Tiempo agotado. La palabra era **${secreta}**.`, embeds: [], components: [] });
            }
        });
    },
};
