const makeWaSocket = require('@adiwajshing/baileys').default;
const { delay, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const P = require('pino');
const { unlink, existsSync, mkdirSync, readFileSync } = require('fs');
const express = require('express');
const { body, validationResult } = require('express-validator');
const http = require('http');
const port = process.env.PORT || 3011;
const port_get = process.env.PORT || 3123;
const port3 = process.env.PORT || 3004;
const app2 = express();
const app3 = express();
const app = express();
const server = http.createServer(app);
const server2 = http.createServer(app2);
const server3 = http.createServer(app3);
const session = require('express-session')
const bodyParser = require("body-parser")
var path = require( 'path')
app3.use(session({secret:'adadwadawd3143t4134rrdsa'}))
app3.use(bodyParser.urlencoded({extends:true }))
app3.engine("html",require('ejs').renderFile)
app3.set('view engine', "html")
app3.use('/public', express.static(path.join(__dirname, "public")))
app3.set("views", path.join(__dirname, "/views"))


var login = "admin"
var password = "10212"

const ZDGPath = './ZDGSessions/';
const ZDGAuth = 'auth_info31.json';
const {WebhookClient} = require('@google-cloud/dialogflow');
const dialogflow = require('@google-cloud/dialogflow');
app2.use(express.json());

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


// const sessionClient = new dialogflow.SessionsClient({keyFilename: "iptv-c9pn-52437d9224f8.json"});


// async function detectIntent(
//    projectId,
//    sessionId,
//    query,
//    contexts,
//    languageCode
//  ) {
//    const sessionPath = sessionClient.projectAgentSessionPath(
//      projectId,
//      sessionId
//    );
 
//    // The text query request.
//    const request = {
//      session: sessionPath,
//      queryInput: {
//        text: {
//          text: query,
//          languageCode: languageCode,
//        },
//      },
//    };
 
//    if (contexts && contexts.length > 0) {
//      request.queryParams = {
//        contexts: contexts,
//      };
//    }
 
//    const responses = await sessionClient.detectIntent(request);
//    return responses[0];
// }

// async function executeQueries(projectId, sessionId, queries, languageCode) {
//    let context;
//    let intentResponse;
//    for (const query of queries) {
//        try {
//            console.log(`Pergunta: ${query}`);
//            intentResponse = await detectIntent(
//                projectId,
//                sessionId,
//                query,
//                context,
//                languageCode
//            );
//            console.log('Enviando Resposta');
//            console.log(" print pra ver",intentResponse.queryResult.fulfillmentText);
//            return `${intentResponse.queryResult.fulfillmentText}`
//        } catch (error) {
//            console.log(error);
//        }
//    }
// }

const ZDGGroupCheck = (jid) => {
   const regexp = new RegExp(/^\d{18}@g.us$/)
   return regexp.test(jid)
}


const ZDGUpdate = (ZDGsock) => {
   ZDGsock.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr){
         console.log(' Qrcode: ', qr);
      };
      if (connection === 'close') {
         const ZDGReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
         if (ZDGReconnect) ZDGConnection()
         status_server = ` CONEXÃO FECHADA! RAZÃO: ` + DisconnectReason.loggedOut.toString()
         console.log(` CONEXÃO FECHADA! RAZÃO: ` + DisconnectReason.loggedOut.toString());
         if (ZDGReconnect === false) {
            const removeAuth = ZDGPath + ZDGAuth
            unlink(removeAuth, err => {
               if (err) throw err
            })
         }
      }
      if (connection === 'open'){
         status_server = ' CONECTADO'
         console.log(' CONECTADO')
      }
   })
}

const ZDGConnection = async () => {
   const { version } = await fetchLatestBaileysVersion()
   if (!existsSync(ZDGPath)) {
      mkdirSync(ZDGPath, { recursive: true });
   }
   const { saveState, state } = useSingleFileAuthState(ZDGPath + ZDGAuth)
   const config = {
      auth: state,
      logger: P({ level: 'error' }),
      printQRInTerminal: true,
      version,
      connectTimeoutMs: 60_000,
      async getMessage(key) {
         // return { conversation: 'botzg' };
      },
   }
   const ZDGsock = makeWaSocket(config);
   ZDGUpdate(ZDGsock.ev);
   ZDGsock.ev.on('creds.update', saveState);

   const ZDGSendMessage = async (jid, msg) => {
      await ZDGsock.presenceSubscribe(jid)
      await delay(2000)
      await ZDGsock.sendPresenceUpdate('composing', jid)
      await delay(1500)
      await ZDGsock.sendPresenceUpdate('unavailable', jid)

      return await ZDGsock.sendMessage(jid, msg)

   }

//    ZDGsock.ev.on('messages.upsert', async ({ messages, type }) => {
//       const msg = messages[0]
//       const jid = msg.key.remoteJid
      
//          if (!ZDGGroupCheck(jid) && !msg.key.fromMe && jid !== 'status@broadcast') {
//             console.log("© BOT-ZDG - MENSAGEM : ", msg)
//             // ZDGsock.sendReadReceipt(jid, msg.key.participant, [msg.key.id]) 
//             let textoResposta = await executeQueries("iptv-c9pn", jid, [JSON.stringify(msg.message.conversation)], 'pt-BR');
            
            
//                console.log('mensagem recebida texto resposta ',textoResposta)
   
   
//                if (textoResposta === ' ' || textoResposta === '' || textoResposta === '{}' || textoResposta === undefined) {
//                   console.log('sem resposta')
//                }
//                else{
//                   console.log('mensagem recebida ')
//                await ZDGSendMessage(jid, {text: textoResposta})
//                   .then(result => console.log('RESULT ZDG: ', result))
//                   .catch(err => console.log('ERRO ZDG: ', err))
//             }}
//       })

   // verificar numero
   app.post('/verificar', [
      body('jid').notEmpty()
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
      const number = req.body.jid;
      const [testando] = await ZDGsock.onWhatsApp(number)

      if (testando !== undefined){
         if (testando.exists === true) {
            
            mensagem = "Esse tem whatsapp";
            console.log (mensagem) 
               res.status(200).json({
                  status: true,
                  // response: response
               });
      }

   } else if (testando === undefined){
      mensagem = "Esse NÃO whatsapp";
      res.status(422).json({
         status: false,

      });

         console.log (mensagem) 
   }

   })

   // Send message
   app.post('/message', [
      body('jid').notEmpty(),
      body('message').notEmpty(),
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const message = req.body.message;

      if (numberDDI !== '55') {
         ZDGSendMessage(jid, { text: message }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGSendMessage(numberZDG, { text: message }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGSendMessage(numberZDG, { text: message }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send message - disparo
   app.post('/message-disparo', [
      body('jid').notEmpty(),
      body('message').notEmpty(),
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const message = req.body.message;

      if (numberDDI !== '55') {
        ZDGSendMessage(jid, { text: message }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGSendMessage(numberZDG, { text: message }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGSendMessage(numberZDG, { text: message }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send button
   app.post('/button', [
      body('jid').notEmpty(),
      body('text').notEmpty(),
      // body('footer').notEmpty(),
      // body('id1').notEmpty(),
      // body('id2').notEmpty(),
      // body('id3').notEmpty(),
      // body('displaytext1').notEmpty(),
      // body('button1').notEmpty(),
      // body('button2').notEmpty(),
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const text = req.body.text;
      // const footer = req.body.footer;
      // const id1 = req.body.id1;
      // const id2 = req.body.id2;
      // const id3 = req.body.id3;
      // const displaytext1 = req.body.button1;
      // const displaytext2 = req.body.button2;
      // const displaytext3 = req.body.displaytext3;
      const buttons = [
         { buttonId: "1", buttonText: { displayText: req.body.button1 }, type: 1 },
         { buttonId: "2", buttonText: { displayText: req.body.button2 }, type: 1 },
         // { buttonId: id3, buttonText: { displayText: displaytext3 }, type: 1 },
      ]
      const buttonsMessage = {
         text: text,
         footer: "Escolha uma opção:",
         buttons: buttons,
         headerType: 1
      }

      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, buttonsMessage).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, buttonsMessage).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, buttonsMessage).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send link
   app.post('/link', [
      body('jid').notEmpty(),
      body('url').notEmpty(),
      body('title').notEmpty(),
      body('description').notEmpty(),
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const url = req.body.url;
      const title = req.body.title;
      const description = req.body.description;

      const link = {
         forward: {
            key: { fromMe: true },
            message: {
               extendedTextMessage: {
                  text: url,
                  matchedText: url,
                  canonicalUrl: url,
                  title: title,
                  description: description,

                  
                  // optional
                  // jpegThumbnail: readFileSync('./assets/icone.png')  //mostra uma thump junto com o link do whatsapp
               }
            }
         }
         
      };

      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, link).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, link).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, link).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send imagem e texto
   app.post('/Imagem-texto', [
      body('jid').notEmpty(),
      body('message').notEmpty(),
      body('imagem').notEmpty(),
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const message = req.body.message;

      const imagem = req.body.imagem;
      const ZDGImagem = {

         caption: message,
         image: {
            url: imagem    // './assets/icone.png',
            // url: 'https://zapdasgalaxias.com.br/wp-content/uploads/elementor/thumbs/icone-2-pdi31v9k8vtxs105ykbgfpwsyu37k4387us769we0w.png'
         },
         
      }


      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send texto e imagem e botoes
   app.post('/Imagem-texto-botoes', [

      body('jid').notEmpty(),
      body('caption').notEmpty(),
      body('image').notEmpty(),
      body('button1').notEmpty(),
      body('button2').notEmpty(),


   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const caption = req.body.caption;
      const image = req.body.image;

      const ZDGImagem = {
         // opicional
         caption: caption,
         // opicional
         footer: 'Escolha uma opção:',
         image: {
            url: image },
         buttons: [
            { buttonId: '1', buttonText: { displayText: req.body.button1 }, type: 1 },
            { buttonId: '2', buttonText: { displayText: req.body.button2 }, type: 1 },
         ]
         
      }


      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send texto e imagem e botoes
   app.post('/video-texto-botoes', [

      body('jid').notEmpty(),
      body('caption').notEmpty(),
      body('video').notEmpty(),
      body('button1').notEmpty(),
      body('button2').notEmpty(),


   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const caption = req.body.caption;
      const video = req.body.video;

      const ZDGImagem = {
         // opicional
         caption: caption,
         // opicional
         footer: 'Escolha uma opção:',
         video: {
            url: video },
         buttons: [
            { buttonId: '1', buttonText: { displayText: req.body.button1 }, type: 1 },
            { buttonId: '2', buttonText: { displayText: req.body.button2 }, type: 1 },
         ]
         
      }


      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send texto e imagem
   app.post('/video-texto', [
      body('jid').notEmpty(),
      body('message').notEmpty(),
      body('video').notEmpty(),
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const message = req.body.message;

      const video = req.body.video;
      const ZDGImagem = {

         caption: message,
         video: {
            url: video    // './assets/icone.png',
            // url: 'https://zapdasgalaxias.com.br/wp-content/uploads/elementor/thumbs/icone-2-pdi31v9k8vtxs105ykbgfpwsyu37k4387us769we0w.png'
         }
      }


      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, ZDGImagem).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send vcard
   app.post('/vcard', [
      body('jid').notEmpty(),
      body('nome').notEmpty(),
      body('telefone').notEmpty(),
      body('phoneNumber').notEmpty(),

   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const nome = req.body.nome;
      const telefone = req.body.telefone;
      const phoneNumber = req.body.phoneNumber;

      const contact = {
         fullName: nome,
         waid:   telefone,
         phoneNumber: phoneNumber
      }

      const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' +
      contact.fullName +
      '\n' +
      'item1.TEL;waid=' +
      contact.waid +
      ':' +
      contact.phoneNumber +
      '\n' +
      'item1.X-ABLabel:Celular\n' +
      'END:VCARD'




      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, {
            contacts: {
               displayName: contact.fullName,
               contacts: [{ vcard, displayName: contact.fullName }]
            }
         }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, {
               contacts: {
                  displayName: contact.fullName,
                  contacts: [{ vcard, displayName: contact.fullName }]
               }
            }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, {
            contacts: {
               displayName: contact.fullName,
               contacts: [{ vcard, displayName: contact.fullName }]
            }
         }).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });


   // Send PDF
   app.post('/PDF', [
      body('jid').notEmpty(),
      body('nomeArquivo').notEmpty(),
      body('document').notEmpty(),
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const nomeArquivo = req.body.nomeArquivo;
      const mimetype = req.body.mimetype;
      const document = req.body.document;

      const sendDoc = {
         fileName: nomeArquivo,
         mimetype: 'application/ogg',
         document: {
            url: document
            // url: 'https://zapdasgalaxias.com.br/exemplo.pdf'
         }
      }


      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, sendDoc).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, sendDoc).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, sendDoc).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }

   });

   // Send AUDIO
   app.post('/audio', [
      body('jid').notEmpty(),
      body('arquivo').notEmpty(),
   ], async (req, res) => {
      const errors = validationResult(req).formatWith(({
      msg
      }) => {
      return msg;
      });
      if (!errors.isEmpty()) {
      return res.status(422).json({
         status: false,
         message: errors.mapped()
      });
      }
   
      const jid = req.body.jid;
      const numberDDI = jid.substr(0, 2);
      const numberDDD = jid.substr(2, 2);
      const numberUser = jid.substr(-8, 8);
      const arquivo = req.body.arquivo;

      const sendAudio = {
         audio: { url: arquivo }, mimetype: 'audio/mp4' ,ptt: true

      }


      if (numberDDI !== '55') {
         ZDGsock.sendMessage(jid, sendAudio).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD <= 30) {
         const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, sendAudio).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });
      }
      if (numberDDI === '55' && numberDDD > 30) {
         const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
         ZDGsock.sendMessage(numberZDG, sendAudio).then(response => {
            res.status(200).json({
               status: true,
               response: response
            });
            }).catch(err => {
            res.status(500).json({
               status: false,
               response: err
            });
            });

      }

   
   });

   
   

   
   
   
   app3.post("/",(req,res)=>{
       console.log(req.body.login)
       console.log(req.body.password)
   
       if (req.body.login == login && req.body.password == password){
           console.log("Logado com sucesso")
   
           req.session.login = login
           // res.render("logado")
           res.status(301).redirect("/logado")
   
   
       }else{
           res.render( 'index')
       }
   })
   
   
   app3.post("/logado",(req,res,next)=>{
       console.log("fazer disparo")
       console.log(req.body.contatos.sp) //.replaceAll('\n', (",")))
       console.log(req.body.mensagem)
       console.log(req.body.intervalo)
   
       const numeros = req.body.contatos.replace(/\r?|\r/g, "").split("\n")
       console.log(numeros)

       const message = req.body.mensagem
       const intervalo = req.body.intervalo * 1000
       console.log(intervalo)
       const checkimagem = req.body.enviarimagem
       console.log("checkimagem=  " +checkimagem)
       const imagem = req.body.urlImagem
       console.log("URLIMAGEM=  " +imagem)
       const checkvideo = req.body.enviarVideo
       console.log("checkvideo=  " +checkvideo)
       const video = req.body.urlVideo
       console.log("URLvideo=  " +video)




    async function disparo(){

        for await (let numero of numeros){
            // console.log(numero,  message)
            const jid = numero
            const numberDDI = jid.substr(0, 2);
            const numberDDD = jid.substr(2, 2);
            const numberUser = jid.substr(-8, 8);
    
            //enviar com imagem
            if (checkimagem == "yes" && checkvideo != "yes" ){
                console.log("enviar imagem")
                const ZDGImagem = {

                    caption: message,
                    image: {
                        url:  imagem    //'./assets/icone.png',
                    //    url: 'https://zapdasgalaxias.com.br/wp-content/uploads/elementor/thumbs/icone-2-pdi31v9k8vtxs105ykbgfpwsyu37k4387us769we0w.png'
                    },
                    
                 }
           
                 if (numberDDI !== '55') {
                    ZDGsock.sendMessage(jid, ZDGImagem)
                 }
                 if (numberDDI === '55' && numberDDD <= 30) {
                    const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
                    ZDGsock.sendMessage(numberZDG, ZDGImagem)
                 }
                 if (numberDDI === '55' && numberDDD > 30) {
                    const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
                    ZDGsock.sendMessage(numberZDG, ZDGImagem)
                 }

            }

            //enviar com video
            else if (checkvideo == "yes" && checkimagem != "yes"){
                console.log("enviar video")
                const ZDGVideo = {

                    caption: message,
                    video: {
                        url:  video    //'./assets/icone.png',
                    //    url: 'https://zapdasgalaxias.com.br/wp-content/uploads/elementor/thumbs/icone-2-pdi31v9k8vtxs105ykbgfpwsyu37k4387us769we0w.png'
                    },
                    
                    }
            
                    if (numberDDI !== '55') {
                    ZDGsock.sendMessage(jid, ZDGVideo)
                    }
                    if (numberDDI === '55' && numberDDD <= 30) {
                    const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
                    ZDGsock.sendMessage(numberZDG, ZDGVideo)
                    }
                    if (numberDDI === '55' && numberDDD > 30) {
                    const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
                    ZDGsock.sendMessage(numberZDG, ZDGVideo)
                    }

            }

            //somente texto
            else if (checkvideo != "yes" && checkimagem != "yes") {
    
             if (numberDDI !== '55') {
                ZDGsock.sendMessage(jid, { text: message });
             }
             if (numberDDI === '55' && numberDDD <= 30) {
                const numberZDG = "55" + numberDDD + "9" + numberUser + "@s.whatsapp.net";
                ZDGsock.sendMessage(numberZDG, { text: message });
             }
             if (numberDDI === '55' && numberDDD > 30) {
                const numberZDG = "55" + numberDDD + numberUser + "@s.whatsapp.net";
                ZDGsock.sendMessage(numberZDG, { text: message });
             }
            }
 
            await delay(intervalo);
 
        }

    }

    disparo()

  
   
   })
   app3.get("/logado",(req,res)=>{
   
       if (req.session.login){
           res.render("logado")
       }
       else {
           res.render( 'index')
       }
   
   })
   
   
   app3.get("/",(req,res)=>{
   
       if (req.session.login){
           res.redirect("logado")
       }
       else {
           res.render( 'index')
       }
   
   })

}



ZDGConnection()














// app3.listen(port3,()=> {
//     console.log("servidor rodando")
// })









app2.get('/status',(request,resposta_status)=>{
   // return resposta_status.json({message : 'servidor esta rodando tranquilo botpost'})
   return resposta_status.json({message :  status_server})


})
server3.listen(port3,function() {
    console.log('status do servidor rodando na porta: ' + port3);
  });


server2.listen(port_get,function() {
   console.log('status do servidor rodando na porta: ' + port_get);
 });

server.listen(port, function() {
   console.log('© BOT-ZDG - Servidor rodando na porta: ' + port);
 });