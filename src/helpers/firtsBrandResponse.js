export default (beforeCompleteTaskPayload, managerStore) => {
    const { flex: { chat: { channels } } } = managerStore.getState()
    const {
            task:{
                dateCreated,
                channelType,
                taskChannelUniqueName,
                setAttributes,
                attributes: {
                    transferredChSid,
                    channelSid,
                    conversations
                } 
            }
        } = beforeCompleteTaskPayload
        if (taskChannelUniqueName === 'chat') {
            console.log("beforeCompleteTaskPayload",beforeCompleteTaskPayload, dateCreated)
            console.log("channels",channels)
            console.log("channelSid",channelSid)
            const taskMessages = (chatChannels, chanelSid) => (chatChannels[chanelSid].messages)
            const messages = taskMessages(channels, channelSid)
            console.log("messages",messages)
            const getAgentFirstMessage = (messages, dateCreated) => messages.find(message => message.isFromMe === true && message.source.timestamp > dateCreated) || 'N/A'
            const agentFirstMessage = getAgentFirstMessage(messages, dateCreated)
            console.log("agentFirstMessage",agentFirstMessage)
            const timestamp = (agentFirstMessage && agentFirstMessage.source) ? agentFirstMessage.source.timestamp : null
            console.log("timestamp",timestamp)
            const taskAge = (firstResponseDate, creationDate) =>  {
                if (!firstResponseDate || !creationDate) {
                    return 'N/A'
                }
                const milliseconds = new Date(firstResponseDate).getTime() - new Date(creationDate).getTime()
                return milliseconds / 1000
            }
            const age = taskAge(timestamp, dateCreated)
            console.log("age",age)
            return age;
        } else {
            console.log(`%c FBR supported channels: web, email`, 'background:green;color:white;text-align:center;font-weight:bold;padding:5px 10px;font-size:15px;border-radius: 10px');
            console.log(`%c current channels: ${channelType}`, 'background:red;color:white;text-align:center;font-weight:bold;padding:5px 10px;font-size:15px;border-radius: 10px');
        }
    }