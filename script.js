let estilo = true
let botaoStop = document.querySelector('#stop')

function trocaTema() {
    if (estilo) {
        document.documentElement.style.setProperty('color-scheme', 'light')
        estilo = false
    } else {
        document.documentElement.style.setProperty('color-scheme', 'dark')
        estilo = true
    }
}

const capturarFala = () => {

    let botao = document.querySelector('#microfone');
    let icone = document.querySelector('#icone');
    let input = document.querySelector('input');

    // Aqui vamos criar um objeto de reconhecimento de fala
    const recognition = new webkitSpeechRecognition();
    recognition.lang = window.navigator.language;
    recognition.interimResults = true;

    botao.addEventListener('mousedown', () => {
        icone.classList.remove('fa-microphone')
        icone.classList.add('fa-ellipsis-h')
        recognition.start();
    });

    botao.addEventListener('mouseup', () => {
        icone.classList.remove('fa-ellipsis-h')
        icone.classList.add('fa-microphone')
        recognition.stop();

        if (input.value != "") {
            PerguntarAoJarvis(input.value);
        }
    });

    // Aqui vamos capturar o resultado da fala
    recognition.addEventListener('result', (e) => {
        const result = e.results[0][0].transcript;
        console.log(result);
        input.value = result;
    });

}

const PerguntarAoJarvis = async (pergunta) => {


    let url = 'https://api.openai.com/v1/chat/completions';
    let header = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
    }

    let body = {
        "model": "ft:gpt-3.5-turbo-0613:zeros-e-um::8DDHyrh4",
        "messages": [
            {
                "role": "system",
                "content": "Jarvis é um chatbot pontual e muito simpático que ajuda as pessoas"
            },
            {
                "role": "user",
                "content": pergunta
            }
        ]
    }

    let options = {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body)
    }

    fetch(url, options).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data.choices[0].message.content);
        FalarComoJarvis(data.choices[0].message.content);
    });

}

const FalarComoJarvis = (texto) => {
    const endpoint = 'https://brazilsouth.tts.speech.microsoft.com/cognitiveservices/v1';

    const requestOptions = {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': azureApiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'curl',
        },
        body: `<speak version='1.0' xml:lang='pt-BR'>
                <voice xml:lang='pt-BR' xml:gender='Female' name='pt-BR-AntonioNeural'>
                 ${texto}
                </voice>
            </speak>`,
    };

    fetch(endpoint, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.arrayBuffer();
            } else {
                throw new Error(`Falha na requisição: ${response.status} - ${response.statusText}`);
            }
        })
        .then(data => {
            const blob = new Blob([data], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);

            const audioElement = new Audio(audioUrl);

            botaoStop.addEventListener('click', () => {
                audioElement.pause()
            })

            audioElement.play();
        })
        .catch(error => {
            console.error('Erro:', error);
        });

}

capturarFala()

