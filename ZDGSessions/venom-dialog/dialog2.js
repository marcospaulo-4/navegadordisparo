const venom = require('venom-bot');
const express = require('express');
const http = require('http');
const {WebhookClient} = require('dialogflow-fulfillment');
const dialogflow = require('@google-cloud/dialogflow');
const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

venom
  .create({headless: false})
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

//webhook dialogflow
app.post('/webhook', function(request,response){
    const agent = new WebhookClient ({ request, response });
        let intentMap = new Map();
        intentMap.set('nomedaintencao', nomedafuncao)
        agent.handleRequest(intentMap);
        });
  function nomedafuncao (agent) {
  }

const sessionClient = new dialogflow.SessionsClient({keyFilename: "NOMEDOSEUJSON.json"});

async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
  ) {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
  
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };
  
    if (contexts && contexts.length > 0) {
      request.queryParams = {
        contexts: contexts,
      };
    }
  
    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Pergunta: ${query}`);
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            console.log('Enviando Resposta');
            console.log(intentResponse.queryResult.fulfillmentText);
            return `${intentResponse.queryResult.fulfillmentText}`
        } catch (error) {
            console.log(error);
        }
    }
}

function start(client) {
  client.onMessage(async (msg) => {

    if (msg.type === "chat"){  
        //integra????o de texto dialogflow
          let textoResposta = await executeQueries("zdg-9un9", msg.from, [msg.body], 'pt-BR');
          const args = textoResposta.split(' | ');
          const link1 = args[0].split('>')
          const link2 = args[1].split('>')
		  const link3 = args[2].split('>')
		  const link4 = args[2].split('>')
		  const argsDialog = textoResposta.split(' * ');
		  const tituloDialog = argsDialog[1];
          const list = [
            {
              title: 'Escolha uma op????o:',
              rows: [
                {
                  title: link1[0],
                  description: link1[1],
                },
                {
                  title: link2[0],
                  description: link2[1],
                },
                {
                  title: link3[0],
                  description: link3[1],
                },
                {
                  title: link4[0],
                  description: link4[1],
                }
              ]
            }
          ];
          client.sendListMenu(msg.from, tituloDialog, 'venom-bot', '\nEstou aqui pra te ajudar com a pergunta: \n\n_' + msg.body + '_\n', 'Clique aqui', list)
        }
  });
}

server.listen(port, function() {
    console.log('App running on *: ' + port);
  });
  

// ESTRAT??GIA ZAP DAS GAL??XIAS
// ZDG ?? 2020
// www.zapdasgalaxias.com.br  
 
