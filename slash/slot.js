const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Centro de juegos y apuestas')
        .addSubcommand(sub => sub.setName('blackjack')
            .setDescription('🃏 Blackjack: Gana a la casa (x1.8)')
            .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta').setMinValue(0).setMaxValue(500)))
        .addSubcommand(sub => sub.setName('snake')
            .setDescription('🐍 Snake: Sobrevive y crece (x1.5)')
            .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta').setMinValue(0).setMaxValue(500)))
        .addSubcommand(sub => sub.setName('slots')
            .setDescription('🎰 Slots: La suerte del casino')
            .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta').setMinValue(0).setMaxValue(500)))
        .addSubcommand(sub => sub.setName('penaltis')
            .setDescription('⚽ Penaltis: Tanda con rondas')
            // IMPORTANTE: Primero la obligatoria (dificultad) para evitar errores de Discord
            .addStringOption(opt => opt.setName('dificultad').setDescription('Nivel').setRequired(true).addChoices(
                { name: 'Fácil (x1.1)', value: 'easy' },
                { name: 'Medio (x1.8)', value: 'mid' },
                { name: 'Difícil (x3.5)', value: 'hard' }
            ))
            .addIntegerOption(opt => opt.setName('amount').setDescription('Apuesta').setMinValue(0).setMaxValue(500))
            .addIntegerOption(opt => opt.setName('rondas').setDescription('Número de tiros').addChoices(
                { name: '1 Ronda', value: 1 },
                { name: '3 Rondas', value: 3 },
                { name: '5 Rondas', value: 5 }
            ))),

    async execute(interaction, user, db) {
        const sub = interaction.options.getSubcommand();
        const amount = interaction.options.getInteger('amount') || 0;
        const esGratis = amount === 0;

        if (!esGratis && user.coins < amount) {
            return interaction.reply({ content: `No tienes suficientes ${db.emoji}. Saldo: ${user.coins}`, flags: [MessageFlags.Ephemeral] });
        }

     if (sub === 'blackjack') {
    // Cobro inicial (Permite deuda)
    if (!esGratis) user.coins -= amount;
    
    const palos = ['♠️', '♥️', '♣️', '♦️'];
    const valores = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    const dar = () => ({ val: valores[Math.floor(Math.random()*13)], palo: palos[Math.floor(Math.random()*4)] });
    const calc = (m) => {
        let p = 0, a = 0;
        m.forEach(c => { if(c.val === "A") a++; else p += (isNaN(c.val) ? 10 : parseInt(c.val)); });
        for(let i=0; i<a; i++) p += (p + 11 <= 21) ? 11 : 1;
        return p;
    };
    const render = (m) => m.map(c => `\`${c.val}${c.palo}\``).join(' ');

    let manoU = [dar(), dar()], manoD = [dar()];
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('h').setLabel('Pedir').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('s').setLabel('Plantarse').setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder().setTitle('🃏 Blackjack').setColor('#2b2d31')
        .addFields(
            { name: 'Tú', value: `${render(manoU)}\nTotal: ${calc(manoU)}`, inline: true }, 
            { name: 'Dealer', value: `${render(manoD)} ??`, inline: true }
        );

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    const col = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 40000 });

    col.on('collect', async i => {
        if (i.customId === 'h') {
            manoU.push(dar());
            if (calc(manoU) > 21) {
                col.stop(); db.saveAll();
                return i.update({ embeds: [new EmbedBuilder().setTitle('💥 Te pasaste').setDescription(`${render(manoU)}\nTotal: ${calc(manoU)}\n\nSaldo: ${user.coins} ${db.emoji}`).setColor('#ED4245')], components: [] });
            }
            await i.update({ embeds: [new EmbedBuilder().setTitle('🃏 Blackjack').setColor('#2b2d31').addFields({ name: 'Tú', value: `${render(manoU)}\nTotal: ${calc(manoU)}`, inline: true }, { name: 'Dealer', value: `${render(manoD)} ??`, inline: true })] });
        } else {
            col.stop();
            while(calc(manoD) < 17) manoD.push(dar());
            let pU = calc(manoU), pD = calc(manoD), res = (pD > 21 || pU > pD) ? 'Ganaste' : (pU === pD ? 'Empate' : 'Perdiste');
            
            if(!esGratis) { 
                if(res==='Ganaste') user.coins += Math.floor(amount * 1.8); 
                else if(res==='Empate') user.coins += amount; 
                db.saveAll(); 
            }
            
            await i.update({ 
                embeds: [new EmbedBuilder().setTitle(res).setColor(res === 'Ganaste' ? '#57F287' : '#2b2d31')
                .addFields({ name: 'Tú', value: `\`${pU}\``, inline: true }, { name: 'Dealer', value: `\`${pD}\``, inline: true })
                .setFooter({ text: `Saldo: ${user.coins} ${db.emoji}${user.coins < 0 ? ' (En deuda 💸)' : ''}` })], 
                components: [] 
            });
        }
    });
}

// --- SNAKE ---
if (sub === 'snake') {
    // Cobro inicial (Permite deuda)
    if (!esGratis) user.coins -= amount;
    let x = 2, y = 2, fx = 0, fy = 0, pts = 0, dir = 'right', cuerpo = [{x:2, y:2}];
    const genF = () => { fx = Math.floor(Math.random()*5); fy = Math.floor(Math.random()*5); };
    genF();
    const draw = () => {
        let b = "";
        for (let i=0; i<5; i++) {
            for (let j=0; j<5; j++) {
                if (cuerpo.some(p => p.x === j && p.y === i)) b += "🟢";
                else if (fx === j && fy === i) b += "🍎";
                else b += "⬛";
            } b += "\n";
        } return b;
    };
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('up').setEmoji('⬆️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('down').setEmoji('⬇️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('left').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('right').setEmoji('➡️').setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle('🐍 Snake').setDescription(draw()).setColor('#57F287')], components: [row] });
    const col = interaction.channel.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });
    const game = setInterval(async () => {
        if (dir==='up') y--; if (dir==='down') y++; if (dir==='left') x--; if (dir==='right') x++;
        if (x<0 || x>4 || y<0 || y>4 || cuerpo.some(p => p.x === x && p.y === y)) {
            clearInterval(game); col.stop();
            const premio = (pts >= 50 && !esGratis) ? Math.floor(amount * 1.5) : 0;
            user.coins += premio; 
            db.saveAll();
            return interaction.editReply({ 
                content: `💥 Game Over. Puntos: ${pts} | Ganancia: ${premio} ${db.emoji}\nSaldo: ${user.coins} ${db.emoji}`, 
                embeds: [], components: [] 
            });
        }
        cuerpo.unshift({x, y});
        if (x === fx && y === fy) { pts += 10; genF(); } else cuerpo.pop();
        await interaction.editReply({ embeds: [new EmbedBuilder().setTitle(`Puntos: ${pts}`).setDescription(draw()).setColor('#57F287')] });
    }, 2200);
    col.on('collect', async i => { dir = i.customId; await i.deferUpdate(); });
}

// --- SLOTS ---
if (sub === 'slots') {
    // 1. Verificar si tiene spins (asumiendo que user.spins existe en tu DB)
    const tieneSpins = user.spins > 0;
    
    // Si tiene spins, el costo extra es 0, si no, es 50
    const costoExtra = tieneSpins ? 0 : 50;
    const apuesta = amount;

    // 2. Manejar el cobro o el descuento de spin
    if (tieneSpins) {
        user.spins -= 1; // Gasta un spin
    } else {
        if (!esGratis) user.coins -= (costoExtra + apuesta); // Cobra los 50 + la apuesta
    }

    const items = ['🍎', '🔔', '🎰', '🍒', '🍋', '💎'];
    await interaction.reply({ content: `🎰 **Girando los slots...** ${tieneSpins ? '(Usando 1 Spin 🌀)' : ''}`, fetchReply: true });
    
    for (let i = 0; i < 3; i++) {
        const anim = [items[Math.floor(Math.random()*6)], items[Math.floor(Math.random()*6)], items[Math.floor(Math.random()*6)]];
        await new Promise(res => setTimeout(res, 600));
        await interaction.editReply({ content: `🎰 **[ ${anim.join(' | ')} ]** ...girando...` });
    }

    const r = [items[Math.floor(Math.random()*6)], items[Math.floor(Math.random()*6)], items[Math.floor(Math.random()*6)]];
    let multGanancia = 0;
    let mensajeFinal = "";
    let color = '#5865F2';

    if (r[0] === r[1] && r[1] === r[2]) {
        multGanancia = 5.0;
        mensajeFinal = `🔥 **¡JACKPOT!** Ganaste **${Math.floor(apuesta * multGanancia)}** ${db.emoji}`;
        color = '#FFD700';
    } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
        multGanancia = 2.0;
        mensajeFinal = `✨ **¡Par!** Ganaste **${Math.floor(apuesta * multGanancia)}** ${db.emoji}`;
        color = '#00FF00';
    } else {
        const multPerdida = (Math.random() * (4.0 - 0.5) + 0.5).toFixed(1); 
        const ajuste = Math.floor(apuesta * (multPerdida - 1));
        
        // Solo resta más dinero si NO usó un spin
        if (!esGratis && !tieneSpins) user.coins -= ajuste;
        
        mensajeFinal = tieneSpins ? `💀 **MALA SUERTE.** Menos mal usaste un spin.` : `💀 **MALA SUERTE.** Perdiste un **x${multPerdida}** de tu apuesta.`;
        color = multPerdida > 2.5 ? '#FF0000' : '#FF4500';
    }

    if (multGanancia > 0) user.coins += Math.floor(apuesta * multGanancia);
    db.saveAll();

    const embed = new EmbedBuilder()
        .setTitle('🎰 CASINO DE LA DEUDA')
        .setColor(color)
        .setDescription(`🏆 **JACKPOT:** 💎|💎|💎 (x5.0)\n🎭 **SUERTE:** 2 iguales (x2.0)\n❌ **PERDICIÓN:** Nada igual\n\n**[ ${r.join(' | ')} ]**\n\n${mensajeFinal}`)
        .setFooter({ 
            text: `Saldo: ${user.coins} ${db.emoji} | Spins: ${user.spins} 🌀${user.coins < 0 ? ' • DEUDA 💸' : ''}` 
        });

    return interaction.editReply({ content: null, embeds: [embed] });
}


// --- PENALTIS ---
if (sub === 'penaltis') {
    const dif = interaction.options.getString('dificultad') || 'mid';
    const rondasMax = interaction.options.getInteger('rondas') || 3;
    let ronda = 1, gU = 0, gP = 0;
    const cfg = { easy: { s: 3, m: 1.1 }, mid: { s: 5, m: 1.8 }, hard: { s: 7, m: 3.5 } };
    
    if (!esGratis) user.coins -= amount; 
    db.saveAll();

    const getPortero = () => { 
        let p = []; 
        while(p.length < cfg[dif].s) { 
            let n = Math.floor(Math.random() * 9) + 1; 
            if(!p.includes(n)) p.push(n); 
        } return p; 
    };

    // Arreglos de botones corregidos [1,2,3], [4,5,6], [7,8,9]
    const row1 = new ActionRowBuilder().addComponents([1, 2, 3].map(n => new ButtonBuilder().setCustomId(`p${n}`).setLabel('🥅').setStyle(ButtonStyle.Secondary)));
    const row2 = new ActionRowBuilder().addComponents([4, 5, 6].map(n => new ButtonBuilder().setCustomId(`p${n}`).setLabel('🥅').setStyle(ButtonStyle.Secondary)));
    const row3 = new ActionRowBuilder().addComponents([7, 8, 9].map(n => new ButtonBuilder().setCustomId(`p${n}`).setLabel('🥅').setStyle(ButtonStyle.Secondary)));

    const msg = await interaction.reply({ 
        embeds: [new EmbedBuilder().setTitle('⚽ Penaltis').setDescription(`Ronda: ${ronda}/${rondasMax}\nMarcador: **${gU} - ${gP}**`).setColor('#2b2d31')], 
        components: [row1, row2, row3], 
        fetchReply: true 
    });

    const col = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });

    col.on('collect', async i => {
        const tiro = parseInt(i.customId.replace('p', ''));
        const portero = getPortero();
        
        if (!portero.includes(tiro)) gU++;
        if (Math.random() > 0.5) gP++;
        ronda++;

        const esMuerteSubita = ronda > rondasMax;
        const hayGanador = (ronda > rondasMax && gU !== gP);

        if (hayGanador) {
            col.stop('finished');
            const gano = gU > gP;
            let premio = 0;
            if (gano && !esGratis) {
                const bonoRondas = 1 + ((rondasMax - 1) * 0.05);
                premio = Math.floor(amount * cfg[dif].m * bonoRondas);
                if (premio > amount * 3.55) premio = Math.floor(amount * 3.55);
                user.coins += premio;
            }
            db.saveAll();
            return i.update({ 
                embeds: [new EmbedBuilder().setTitle(gano ? '🏆 ¡Ganaste!' : '❌ Perdiste')
                .setDescription(`Marcador final: **${gU} - ${gP}**\n${gano ? `Premio: **${premio} ${db.emoji}**` : 'Suerte la próxima.'}`)
                .setFooter({ text: `Saldo: ${user.coins} ${db.emoji}` })
                .setColor(gano ? '#57F287' : '#ED4245')], 
                components: [] 
            });
        }
        await i.update({ embeds: [new EmbedBuilder().setTitle('⚽ Penaltis').setDescription(`Ronda: ${ronda > rondasMax ? '**MUERTE SÚBITA**' : `**${ronda}/${rondasMax}**`}\nMarcador: **${gU} - ${gP}**`).setColor('#FEE75C')] });
    });
}
// AQUÍ CIERRA EL COMANDO PRINCIPAL (Asegúrate de tener estas llaves)
    }
};