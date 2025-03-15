const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const { state, saveState } = useSingleFileAuthState('./chanda-md-session.json');

// Function to connect the bot
async function startCHANDAMD() {
    const socket = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
            if (shouldReconnect) {
                startCHANDAMD();
            } else {
                console.log('Connection closed. You are logged out.');
            }
        } else if (connection === 'open') {
            console.log('CHANDA-MD is now connected!');
        }
    });

    socket.ev.on('creds.update', saveState);

    // Listen for incoming messages
    socket.ev.on('messages.upsert', ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return; // Ignore system messages
        const messageContent = msg.message.conversation || '';
        console.log('Received:', messageContent);

        if (messageContent.toLowerCase() === 'hello') {
            socket.sendMessage(msg.key.remoteJid, { text: 'Hello! I am CHANDA-MD, your bot companion.' });
        }
    });
}

startCHANDAMD();
