const OpenAI = require('openai');
const axios = require('axios');


const {openai_org, openai_api_key, id_assistant, ticket_token} = require('../utils/config/index')

const apiKey= openai_api_key
const organization= openai_org
const assistant_id= id_assistant


//Inicia openai
const openai = new OpenAI({
    apiKey: apiKey,
    organization: organization,
})

const addTickets = async (req, res) => {
    try {
        // Consulta de ejemplo del usuario
        const query = `date=2024-11-06 time=10:35:21 device_id=FG100ETK20001048 log_id=0100032005 type=traffic subtype=forward 
        pri=critical src=10.10.0.5 dst=192.168.1.10 src_port=22 dst_port=22 src_int="port4" dst_int="port1" service="SSH" 
        action=accept status=success session_id=123456792 duration=15 policy_id=7 bytes=3072 bytes_sent=2048 bytes_received=1024"`;

        // Llama a la función beta con la query y obtiene el string JSON
        const modelDataString = await beta(query);
        console.log('SOY MODEL DATA STRING', modelDataString);

        // Convierte el string JSON en un objeto
        const modelData = JSON.parse(modelDataString);
        console.log('SOY MODEL DATA PARSEADO', modelData);

        //Validar que sea un objeto válido para crear el ticket

        // Envía el array de tickets al endpoint
        const ticket = await axios.post('http://localhost:8080/api/v1/tickets', modelData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ticket_token}`
            }
        });


        //Falta opcion si la ticketera no responde o responde diferente a los esperado


        // Envía solo los datos del ticket en la respuesta
        res.status(200).send(ticket.data); 

    } catch (error) {
        console.log("Algo salió mal: ", error);

        // Extrae detalles del error evitando estructura circular
        const errorDetails = {
            message: error.message,
            code: error.code,
            stack: error.stack,
        };

        res.status(500).send({ message: "Ocurrió un error", error: errorDetails });
    }
};



const beta = async (query) => {
    try {
        const thread = await openai.beta.threads.create(); // Crea un hilo de conversación
        const thread_id = thread.id; // Asigna el nuevo thread_id
        
        const messageText = `Eventos: ${query}`;

        const message = await openai.beta.threads.messages.create(thread_id, {
            role: "user",
            content: messageText
        });

        const run = await openai.beta.threads.runs.create(thread_id, {
            assistant_id: assistant_id
        });
        const run_id = run.id;

        let retries = 10;
        const interval = 2000;
            
        while (retries > 0) {
            // Verifica el estado del mensaje
            const runs = await openai.beta.threads.runs.retrieve(thread_id, run_id);
            console.log("Estado actual: ", runs.status);
            
            if (runs.status === "completed") {
                // Verifica toda la respuesta
                const messages = await openai.beta.threads.messages.list(thread_id);
                // Accediendo al contenido del mensaje
                const response = messages.data[0].content[0].text.value;
                if (response) {return response} else { return {message: 'No hay eventos relevantes.'}};

            } else if (runs.status === "failed") {
                return { message: 'Error en la ejecución.' };

            }
            
            // Intervalo de tiempo para verificar que se completó la consulta al modelo
            await new Promise(resolve => setTimeout(resolve, interval));
            retries--;
        }
        
    } catch (error) {
        console.log("Algo salió mal: ", error);
        return { message: "Ocurrió un error" };
    }
};


  module.exports = {
    addTickets
}