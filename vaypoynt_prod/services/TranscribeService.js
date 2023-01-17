const fs = require('fs');
const config = require('../config');
const fetch = require('node-fetch');

const assembly = {
    upload: () => {

        const url = 'https://api.assemblyai.com/v2/transcript';

        let args = config.argv.slice(2);
        let audioUrl = args[0];
        const data = {
            "audio_url": audioUrl
        };
        const params = {
            headers: {
                "authorization": config.ASSEMBLYAI_API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify(data),
            method: "POST"
        };

        fetch(url, params)
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                console.log('ID:', data['id']);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    },

    download: (id) => {
        const url = `https://api.assemblyai.com/v2/transcript/${id}`;

        const params = {
            headers: {
                "authorization": config.ASSEMBLYAI_API_KEY,
                "content-type": "application/json",
            },
            method: 'GET'
        };


        function print(data) {
            switch (data.status) {
                case 'queued':
                case 'processing':
                    console.log('AssemblyAI is still transcribing your audio, please try again in a few minutes!');
                    break;
                case 'completed':
                    console.log(`Success: ${data}`);
                    console.log(`Text: ${data.text}`);
                    break;
                default:
                    console.log(`Something went wrong :-( : ${data.status}`);
                    break;
            }
        }

        fetch(url, params)
            .then(response => response.json())
            .then(data => {
                print(data);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
            });
    }
}
module.exports = assembly;