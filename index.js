const {
  ActivityType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
} = require('discord.js');
require('dotenv').config();

const PREFIX = process.env.PREFIX || '!';
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN is missing. Add it to your .env file or environment variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const commandList = [
  { name: 'help', usage: 'help', desc: 'يعرض جميع الأوامر.' },
  { name: 'ping', usage: 'ping', desc: 'فحص سرعة استجابة البوت.' },
  { name: 'id', usage: 'id [@member]', desc: 'معلومات حسابك أو عضو محدد.' },
  { name: 'avatar', usage: 'avatar [@member]', desc: 'يعرض صورة الحساب.' },
  { name: 'server', usage: 'server', desc: 'معلومات عن السيرفر.' },
  { name: 'say', usage: 'say <text>', desc: 'إرسال رسالة عبر البوت (إدارة الرسائل).' },
  { name: 'clear', usage: 'clear <1-100>', desc: 'حذف رسائل من الروم (إدارة الرسائل).' },
  { name: 'kick', usage: 'kick @member [reason]', desc: 'طرد عضو (طرد الأعضاء).' },
  { name: 'ban', usage: 'ban @member [reason]', desc: 'حظر عضو (حظر الأعضاء).' },
];

function buildHelpEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x00ae86)
    .setTitle('🇮🇶 قائمة أوامر البوت')
    .setDescription(`البادئة الحالية: \`${PREFIX}\``)
    .setFooter({ text: 'بوت عربي - Iraq style' });

  for (const command of commandList) {
    embed.addFields({
      name: `${PREFIX}${command.usage}`,
      value: command.desc,
    });
  }

  return embed;
}

function hasPerm(member, permission) {
  return member.permissions.has(permission);
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity(`${PREFIX}help`, { type: ActivityType.Watching });
});

client.on('messageCreate', async (message) => {
  try {
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    if (command === 'help') {
      await message.reply({ embeds: [buildHelpEmbed()] });
      return;
    }

    if (command === 'ping') {
      const sent = await message.reply('🏓 جاري القياس...');
      const latency = sent.createdTimestamp - message.createdTimestamp;
      await sent.edit(`🏓 Pong | latency: **${latency}ms**`);
      return;
    }

    if (command === 'id') {
      const member = message.mentions.members.first() || message.member;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🪪 معلومات العضو')
        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'الاسم', value: member.user.tag, inline: true },
          { name: 'ID', value: member.id, inline: true },
          { name: 'دخل السيرفر', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          {
            name: 'تاريخ إنشاء الحساب',
            value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
            inline: true,
          }
        );

      await message.reply({ embeds: [embed] });
      return;
    }

    if (command === 'avatar') {
      const member = message.mentions.members.first() || message.member;
      const avatar = member.displayAvatarURL({ dynamic: true, size: 1024 });

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle(`🖼️ صورة ${member.user.username}`)
        .setImage(avatar)
        .setURL(avatar);

      await message.reply({ embeds: [embed] });
      return;
    }

    if (command === 'server') {
      const { guild } = message;
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle(`🏠 ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
          { name: 'الأعضاء', value: `${guild.memberCount}`, inline: true },
          { name: 'عدد الرومات', value: `${guild.channels.cache.size}`, inline: true },
          { name: 'تاريخ الإنشاء', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
        );

      await message.reply({ embeds: [embed] });
      return;
    }

    if (command === 'say') {
      if (!hasPerm(message.member, PermissionsBitField.Flags.ManageMessages)) {
        await message.reply('❌ لازم تكون عندك صلاحية **إدارة الرسائل**.');
        return;
      }

      const text = args.join(' ');
      if (!text) {
        await message.reply(`الاستخدام: \`${PREFIX}say <النص>\``);
        return;
      }

      await message.delete().catch(() => null);
      await message.channel.send(text);
      return;
    }

    if (command === 'clear') {
      if (!hasPerm(message.member, PermissionsBitField.Flags.ManageMessages)) {
        await message.reply('❌ لازم تكون عندك صلاحية **إدارة الرسائل**.');
        return;
      }

      const amount = Number(args[0]);
      if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
        await message.reply(`الاستخدام: \`${PREFIX}clear <رقم من 1 إلى 100>\``);
        return;
      }

      const deleted = await message.channel.bulkDelete(amount, true);
      const msg = await message.channel.send(`✅ تم حذف **${deleted.size}** رسالة.`);
      setTimeout(() => msg.delete().catch(() => null), 3000);
      return;
    }

    if (command === 'kick') {
      if (!hasPerm(message.member, PermissionsBitField.Flags.KickMembers)) {
        await message.reply('❌ لازم تكون عندك صلاحية **طرد الأعضاء**.');
        return;
      }

      const member = message.mentions.members.first();
      if (!member) {
        await message.reply(`الاستخدام: \`${PREFIX}kick @member [reason]\``);
        return;
      }

      if (!member.kickable) {
        await message.reply('❌ ما أقدر أطرد هذا العضو (تحقق من رتبة البوت).');
        return;
      }

      const reason = args.slice(1).join(' ') || 'بدون سبب';
      await member.kick(reason);
      await message.channel.send(`👢 تم طرد **${member.user.tag}** | السبب: **${reason}**`);
      return;
    }

    if (command === 'ban') {
      if (!hasPerm(message.member, PermissionsBitField.Flags.BanMembers)) {
        await message.reply('❌ لازم تكون عندك صلاحية **حظر الأعضاء**.');
        return;
      }

      const member = message.mentions.members.first();
      if (!member) {
        await message.reply(`الاستخدام: \`${PREFIX}ban @member [reason]\``);
        return;
      }

      if (!member.bannable) {
        await message.reply('❌ ما أقدر أحظر هذا العضو (تحقق من رتبة البوت).');
        return;
      }

      const reason = args.slice(1).join(' ') || 'بدون سبب';
      await member.ban({ reason });
      await message.channel.send(`🔨 تم حظر **${member.user.tag}** | السبب: **${reason}**`);
      return;
    }

    await message.reply(`❓ أمر غير معروف. اكتب \`${PREFIX}help\` حتى تشوف الأوامر.`);
  } catch (error) {
    console.error('messageCreate error:', error);
    await message.reply('⚠️ صار خطأ غير متوقع. حاول مرة ثانية.').catch(() => null);
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

client.login(TOKEN);
