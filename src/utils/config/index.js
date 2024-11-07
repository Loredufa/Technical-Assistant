require('dotenv').config();

module.exports = {
    host : process.env.HOST,
    PORT : process.env.PORT,
    secretKey : process.env.SECRET_KEY,
    openai_org : process.env.OPENAI_ORG,
    openai_api_key : process.env.OPENAI_API_KEY,
    id_assistant : process.env.ASSISTANT_ID,
    ticket_token : process.env.TICKET_TOKEN,
    id_assistant_ta : process.env.ASSISTANT_TA_ID,
};
