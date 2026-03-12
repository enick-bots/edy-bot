const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Centro de juegos y apuestas')
        .addSubcommand(sub => sub.setName('blackjack')
            .setDescription('🃏 Blackjack: Llega a 21 (Gana x2)')
            .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta (10-500) o 0 para gratis').setMinValue(0).setMaxValue(500)))
        .addSubcommand(sub => sub.setName('snake')
            .setDescription('🐍 Snake: Muevete y sobrevive (Gana x2)')
            .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta (10-500) o 0 para gratis').setMinValue(0).setMaxValue(500)))
        .addSubcommand(sub => sub.setName('slots')
            .setDescription('🎰 Slots: Gana hasta x3 (Costo: Apuesta + 50 tirada)')
            .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta (10-500) o 0 para gratis').setMinValue(0).setMaxValue(500)))
        .addSubcommand(sub => sub.setName('penaltis')
            .setDescription('⚽ Penaltis: Duelo de arquería')
            .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta (10-500) o 0 para gratis').setMinValue(0).setMaxValue(500))
            .addStringOption(opt => opt.setName('dificultad').setDescription('Nivel del portero').addChoices(
                { name: 'Fácil (2 huecos)', value: 'easy' },
                { name: 'Medio (4 huecos)', value: 'mid' },
                { name: 'Difícil (6 huecos)', value: 'hard' }
            ))),

    async execute(interaction) {
        const user = db.getUser(interaction.user.id);
        const sub = interaction.options.getSubcommand();
        const amount = interaction.options.getInteger('amount') || 0;
        const esGratis = amount === 0;

        if (!esGratis && user.coins < amount) {
            return interaction.reply({ content: `No tienes suficientes coins. Saldo: ${user.coins}`, ephemeral: true });
        }

        // --- BLACKJACK ---
        if (sub === 'blackjack') {
            if (!esGratis) user.coins -= amount;
            const mazo = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
            const dar = () => mazo[Math.floor(Math.random()*mazo.length)];
            const calc = (m) => {
                let p = 0, a = 0;
                m.forEach(c => { if(c==="A") a++; else p += (isNaN(c)?10:parseInt(c)); });
                for(let i=0; i<a; i++) p += (p+11 <= 21) ? 11 : 1;
                return p;
            };

            let manoU = [dar(), dar()], manoD = [dar()];
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('h').setLabel('Pedir').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('s').setLabel('Plantarse').setStyle(ButtonStyle.Secondary)
            );

            const embed = new EmbedBuilder().setTitle('Juego de Blackjack').setColor(0x000000)
                .addFields(
                    { name: 'Tus Cartas', value: `${manoU.join(' ')}\nTotal: ${calc(manoU)}`, inline: true },
                    { name: 'Dealer', value: `${manoD[0]} ?`, inline: true }
                );

            const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
            const col = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 40000 });

            col.on('collect', async i => {
                if (i.customId === 'h') {
                    manoU.push(dar());
                    if (calc(manoU) > 21) {
                        col.stop();
                        db.saveAll();
                        return i.update({ embeds: [new EmbedBuilder().setTitle('Perdiste').setColor(0x000000).setDescription(`Te pasaste con ${calc(manoU)}\nMano: ${manoU.join(' ')}`)], components: [] });
                    }
                    await i.update({ embeds: [new EmbedBuilder().setTitle('Juego de Blackjack').setColor(0x000000).addFields({ name: 'Tus Cartas', value: `${manoU.join(' ')}\nTotal: ${calc(manoU)}`, inline: true }, { name: 'Dealer', value: `${manoD[0]} ?`, inline: true })] });
                } else {
                    col.stop();
                    while(calc(manoD) < 17) manoD.push(dar());
                    let pU = calc(manoU), pD = calc(manoD);
                    let res = (pD > 21 || pU > pD) ? 'Ganaste' : (pU === pD ? 'Empate' : 'Perdiste');
                    if(!esGratis) { if(res==='Ganaste') user.coins += amount*2; else if(res==='Empate') user.coins += amount; db.saveAll(); }
                    await i.update({ embeds: [new EmbedBuilder().setTitle(res).setColor(0x000000).addFields({ name: 'Tú', value: `${pU}`, inline: true }, { name: 'Dealer', value: `${pD}`, inline: true }).setFooter({ text: `Saldo final: ${user.coins}` })], components: [] });
                }
            });
        }

        // --- SLOTS ---
        if (sub === 'slots') {
            const extra = esGratis ? 0 : 50;
            if (!esGratis && user.coins < (amount + extra)) return interaction.reply({ content: 'Faltan 50 coins por servicio.', ephemeral: true });
            if (!esGratis) user.coins -= (amount + extra);

            const ems = ['💎', '🎰', '🔔', '🍒'];
            const r = [ems[Math.floor(Math.random()*4)], ems[Math.floor(Math.random()*4)], ems[Math.floor(Math.random()*4)]];
            let mult = (r[0] === r[1] && r[1] === r[2]) ? 3 : (r[0] === r[1] || r[1] === r[2] || r[0] === r[2] ? 1.5 : 0);
            
            if (!esGratis) user.coins += Math.floor(amount * mult);
            db.saveAll();

            const embed = new EmbedBuilder().setTitle('Maquina de Slots').setColor(0x000000)
                .setDescription(`[ ${r.join(' | ')} ]\n\n${mult > 0 ? `Ganaste ${amount * mult} coins` : 'Perdiste la apuesta'}`)
                .setFooter({ text: `Saldo: ${user.coins}` });
            return interaction.reply({ embeds: [embed] });
        }

        // --- PENALTIS ---
        if (sub === 'penaltis') {
            const dif = interaction.options.getString('dificultad') || 'mid';
            const slots = dif === 'easy' ? 2 : (dif === 'mid' ? 4 : 6);
            const portero = Array.from({ length: slots }, () => Math.floor(Math.random() * 9) + 1);

            const rows = [
                new ActionRowBuilder().addComponents([1, 2, 3].map(n => new ButtonBuilder().setCustomId(`p${n}`).setLabel('🥅').setStyle(ButtonStyle.Secondary))),
                new ActionRowBuilder().addComponents([4, 5, 6].map(n => new ButtonBuilder().setCustomId(`p${n}`).setLabel('🥅').setStyle(ButtonStyle.Secondary))),
                new ActionRowBuilder().addComponents([7, 8, 9].map(n => new ButtonBuilder().setCustomId(`p${n}`).setLabel('🥅').setStyle(ButtonStyle.Secondary)))
            ];

            const msg = await interaction.reply({ content: `El portero cubre ${slots} lugares. ¡Tira!`, components: rows, fetchReply: true });
            const col = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 20000 });

            col.on('collect', async i => {
                col.stop();
                if (!esGratis) user.coins -= amount;
                const tiro = parseInt(i.customId.replace('p', ''));
                const gol = !portero.includes(tiro);
                if (gol && !esGratis) user.coins += amount * 2;
                db.saveAll();
                await i.update({ content: gol ? `Gol ganado: ${amount * 2} coins` : `Atajado por el portero`, components: [], embeds: [new EmbedBuilder().setColor(0x000000).setFooter({ text: `Saldo: ${user.coins}` })] });
            });
        }

        // --- SNAKE ---
        if (sub === 'snake') {
            if (!esGratis) user.coins -= amount;
            db.saveAll();

            let x = 2, y = 2, fx = 0, fy = 0, pts = 0;
            const genF = () => { fx = Math.floor(Math.random()*5); fy = Math.floor(Math.random()*5); };
            genF();

            const draw = () => {
                let b = "";
                for (let i=0; i<5; i++) {
                    for (let j=0; j<5; j++) {
                        if (x === j && y === i) b += "🟢";
                        else if (fx === j && fy === i) b += "🍎";
                        else b += "⬛";
                    }
                    b += "\n";
                }
                return b;
            };

            const ctrl = [
                new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('up').setLabel('Arriba').setStyle(ButtonStyle.Secondary)),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('left').setLabel('Izquierda').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('down').setLabel('Abajo').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('right').setLabel('Derecha').setStyle(ButtonStyle.Secondary)
                )
            ];

            const msg = await interaction.reply({ embeds: [new EmbedBuilder().setTitle('Juego Snake').setDescription(draw()).setColor(0x000000)], components: ctrl, fetchReply: true });
            const col = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });

            col.on('collect', async i => {
                if (i.customId === 'up') y--; if (i.customId === 'down') y++;
                if (i.customId === 'left') x--; if (i.customId === 'right') x++;

                if (x<0 || x>4 || y<0 || y>4) {
                    col.stop();
                    const final = pts >= 30 && !esGratis ? amount * 2 : 0;
                    if (final > 0) user.coins += final;
                    db.saveAll();
                    return i.update({ content: `Chocaste. Puntos: ${pts}. Ganancia: ${final}`, embeds: [], components: [] });
                }

                if (x === fx && y === fy) { pts += 10; genF(); }
                await i.update({ embeds: [new EmbedBuilder().setTitle(`Puntos: ${pts}`).setDescription(draw()).setColor(0x000000)] });
            });
        }
    }
};
