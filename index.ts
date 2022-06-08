import DiscordJS, { Intents, TextChannel, MessageEmbed, Snowflake, ColorResolvable, }  from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()

const CHANNEL_ID = process.env.REMINDER_CHANNEL_ID as Snowflake
const TRIGGER_MESSAGE = process.env.TRIGGER_MESSAGE as string
const REMINDER_TO_MENTION_ID = process.env.REMINDER_TO_MENTION_ID as Snowflake
const MESSAGE_LINE = process.env.MESSAGE_LINE as string


const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ],
})

client.on('ready', () => {
    console.log('The bot is ready')
})

client.on('messageCreate', (message) => {

    if (message.author.bot) return;

    // only when mentioned or includes texts
    if(REMINDER_TO_MENTION_ID !== "" && (message.content.includes(`<@${REMINDER_TO_MENTION_ID}>`)) || 
    (TRIGGER_MESSAGE !== "" && message.content.includes(TRIGGER_MESSAGE))) {
        let author = message.author;
        let username = author.username
        let avatorDisplayUrl = author.displayAvatarURL({ dynamic: true})
        let link = message.url;
        let channel = client.channels.cache.get(CHANNEL_ID) as TextChannel

        const exampleEmbed = new MessageEmbed()
            .setColor('#674cf5')
            .setTitle('メッセージ')
            .setURL(link)
            .setAuthor({
                name: username, 
                iconURL: avatorDisplayUrl, 
                url: link
            })
            .setDescription(message.content)
            .setTimestamp()
        channel.send(
            { 
                content: `<@${REMINDER_TO_MENTION_ID}> ${username} ${MESSAGE_LINE}`,
                embeds: [exampleEmbed] 
            }
        );
    }
})

client.login(process.env.TOKEN)