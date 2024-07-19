require('dotenv').config();  // Load environment variables from .env file
const fastify = require('fastify')({ logger: true });
const multipart = require('@fastify/multipart');
const axios = require('axios');

// Add a console log to verify the API key
console.log('Hugging Face API Key:', process.env.HUGGINGFACE_API_KEY);

fastify.register(multipart);

fastify.post('/api/upload', async (request, reply) => {
    try {
        const data = await request.file();
        const fileBuffer = await data.toBuffer();

        // Call Hugging Face API for analysis
        const analysisResult = await analyzeFile(fileBuffer);

        reply.send({ analysis: analysisResult });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to process the file.' });
    }
});

fastify.post('/api/question', async (request, reply) => {
    try {
        const { question, context } = request.body;

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/distilbert-base-uncased',
            {
                inputs: `${context}\n\nQuestion: ${question}`
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
                }
            }
        );

        reply.send({ answer: response.data[0].summary_text });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to get the answer from AI.' });
    }
});

const analyzeFile = async (fileBuffer) => {
    try {
        const fileContent = fileBuffer.toString('utf-8'); // Convert buffer to string
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/distilbert-base-uncased',
            {
                inputs: fileContent
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
                }
            }
        );

        return response.data[0].summary_text;
    } catch (error) {
        console.error('Error analyzing file:', error);
        throw new Error('Failed to analyze the file with Hugging Face API.');
    }
};

fastify.listen({ port: 3001 }, (err, address) => {
    if (err) throw err;
    console.log(`Server listening at ${address}`);
});
