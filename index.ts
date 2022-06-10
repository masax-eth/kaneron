import DiscordJS, { Intents, TextChannel, MessageEmbed, Snowflake, Message }  from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()

const CHANNEL_ID = process.env.REMINDER_CHANNEL_ID as Snowflake
const TRIGGER_MESSAGE = process.env.TRIGGER_MESSAGE as string
const REMINDER_TO_MENTION_ID = process.env.REMINDER_TO_MENTION_ID as Snowflake
const MESSAGE_LINE = process.env.MESSAGE_LINE as string
const MESSAGE_REPLY = process.env.MESSAGE_REPLY as string
const REACT_EMOJI = process.env.REACT_EMOJI as string



const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
})

client.on('ready', () => {
    console.log('The bot is ready')
})

client.on('messageCreate', (message) => {
    try {

        // if it's from a bot
        if (message.author.bot) return

        // If it's from the target person
        if (message.author.id === REMINDER_TO_MENTION_ID) {
            return
        }

        // check if it's a reply to another message
        let repliedMessage = null
        let additionalMessage = MESSAGE_LINE
        if (message.reference !== null) {
            let repliedMessageId = message.reference.messageId as string
            let repliedChannelId = message.reference.channelId as string
            let repliedGuildId = message.reference.guildId as string

            // if replied message's author is the target person
            try {
                let repliedChannel = client.guilds.cache.get(repliedGuildId)?.channels.cache.get(repliedChannelId) as TextChannel
                repliedMessage = repliedChannel.messages.cache.get(repliedMessageId) as Message
                additionalMessage = MESSAGE_REPLY
        
            } catch (error) {
                console.error('Catched error:'+error)
            }
        }

        if (
            // only when mentioned or includes texts
            checkMessage(message) || 
            // or repliedMessage is from the target or repliedMessage contains the condition
            (repliedMessage != null && (repliedMessage.author.id === REMINDER_TO_MENTION_ID || checkMessage(repliedMessage)))) {
            
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
            
            // attach replied message
            if (repliedMessage != null) {
                exampleEmbed.addField('Original Message', repliedMessage.content, true)
            }
            
            try {
                channel.send(
                    { 
                        content: `<@${REMINDER_TO_MENTION_ID}> ${username} ${additionalMessage}`,
                        embeds: [exampleEmbed] 
                    }
                );
            } finally {
                // react with emoji when the message is sent successfuly
                message.react(REACT_EMOJI)
            }
        }
    } catch (error) {
        console.log(new Date());
        console.error('Catched error:'+error)
    }
})


function checkMessage (message: Message): boolean {
    return REMINDER_TO_MENTION_ID !== "" && (message.content.includes(`<@${REMINDER_TO_MENTION_ID}>`)) || 
    (TRIGGER_MESSAGE !== "" && message.content.includes(TRIGGER_MESSAGE))
}



client.login(process.env.TOKEN)