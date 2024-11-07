const OpenAI = require('openai');
const axios = require('axios');


const {openai_org, openai_api_key, id_assistant_ta} = require('../utils/config/index')

const apiKey= openai_api_key
const organization= openai_org
const assistant_id= id_assistant_ta


//Inicia openai
const openai = new OpenAI({
    apiKey: apiKey,
    organization: organization,
})


const Technical_assistant = async (req, res) => {
    try {
        const query = req.body.query;
        console.log('Consulta del usuario:', query);

        const thread = await openai.beta.threads.create(); // Crea un hilo de conversación
        const thread_id = thread.id; // Asigna el nuevo thread_id
        
        // Modificar el mensaje para aclarar el alcance de la búsqueda
        const messageText = `Responde utilizando el documento FortiOS-7.6.0-Administration_Guide. Pregunta del usuario: ${query}`;

        const message = await openai.beta.threads.messages.create(thread_id, {
            role: "user",
            content: messageText
        });

        const run = await openai.beta.threads.runs.create(thread_id, {
            assistant_id: assistant_id,
            
        });
        const run_id = run.id;

        let retries = 10;
        const interval = 2000;
        let responseSent = false;
            
        while (retries > 0 && !responseSent) {
            const runs = await openai.beta.threads.runs.retrieve(thread_id, run_id);
            console.log("Estado actual: ", runs.status);
            
            if (runs.status === "completed") {
                const messages = await openai.beta.threads.messages.list(thread_id);
                const response = messages.data[0].content[0].text.value;
                
                if (response) {
                    res.status(200).send(response);
                } else {
                    res.status(400).send({ message: 'No hay respuesta relevante en los documentos.' });
                }
                
                responseSent = true;
            } else if (runs.status === "failed") {
                res.status(500).send({ message: 'Error en la ejecución.' });
                responseSent = true;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
            retries--;
        }

        if (!responseSent) {
            res.status(500).send({ message: "Tiempo de espera agotado" });
        }
        
    } catch (error) {
        console.log("Algo salió mal: ", error);
        if (!res.headersSent) {
            res.status(500).send({ message: "Ocurrió un error" });
        }
    }
};

module.exports = {
    Technical_assistant 
};

