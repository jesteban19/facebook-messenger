const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const APP_TOKEN = 'EAAQu2RU44mgBAOiPVo1PyTJE4x47tASKMZAQJ56mBlV5YrrpEZB2eACt2WrFXfaOfNRX4bAiYCyaE9bdNJxxFz9yvXLjFQipWZBysdUtZB743jn71ICGA7D0QKW9vZCOHPPPfjb8ywwtB4FGCkaFd3M7IqFzceW0itcqAXZBRc8wZDZD'

var app = express()

app.use(bodyParser.json())

var PORT = process.env.PORT || 3000;

app.listen(PORT,function(){
	console.log('Server listen localhost:3000')
})

app.get('/',function(req, res){
	res.send('Abriendo el puerto desde mi pc Local con http://ngrok.com')
})

app.get('/webhook',function(req, res){
	if(req.query['hub.verify_token'] === 'hello_token'){
		res.send(req.query['hub.challenge'])
	}else{
		res.send('Tu no tienes que entrar aqui')
	}
})

app.post('/webhook',function(req, res){
	var data = req.body
	if(data.object == 'page'){
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){					
					getMessage(messagingEvent)
				}
			})
		})
	}
	res.sendStatus(200)
})

function getMessage(event){
	var senderID = event.sender.id
	var messageText = event.message.text

	evaluarMensaje(senderID, messageText)
}

function evaluarMensaje(senderID, messageText){
	var mensaje = '';

	if(isContain(messageText,'ayuda')){
		mensaje = 'Por el momento no te puedo ayudar :('
	}else if(isContain(messageText,'info')){
		mensaje = 'Hola que tal nuestro numero de telefono es: XXX-5545\n mi correo es: esteban.programador@gmail.com'
	}else if(isContain(messageText,'perro')){
		enviarMensajeImagen(senderID)
	}else if(isContain(messageText,'perfil')){
		enviarMensajeTemplate(senderID)
	}else if(isContain(messageText,'clima') || isContain(messageText,'temperatura')){
		getClima(function(_temperatura){
			enviarMensajeTexto(senderID, getMessageCLima(_temperatura))
		})
	}else{
		mensaje = '[Heroku]solo se repetir las cosas T_T '+ messageText
	}

	enviarMensajeTexto(senderID, mensaje)
}

function enviarMensajeTemplate(senderID){
	var messageData = {
		recipient: {
			id : senderID
		},
		message: {
			attachment :{
				type: "template",
				payload: {
					template_type: 'generic',
					elements: [elementTemplate(),elementTemplate(),elementTemplate(),elementTemplate()]
				}
			}
		}
	}

	callSendAPI(messageData)
}

function elementTemplate(){
	return {
		title: "Joseph Esteban Carrasco",
		subtitle: "Programador freelance & Youtuber",
		item_url: "http://informaticomanchay.com",
		image_url: "https://s-media-cache-ak0.pinimg.com/564x/ef/e8/ee/efe8ee7e20537c7af84eaaf88ccc7302.jpg",
		buttons: [
			buttonTemplate('Contactame','http://informaticomanchay.com/contacto'),
			buttonTemplate('Portafolio','http://informaticomanchay.com/')
		]
	}
}

function buttonTemplate(title,url){
	return {
		type: 'web_url',
		url: url,
		title: title
	}
}

//enviar imagen

function enviarMensajeImagen(senderID){
	var messageData = {
		recipient : {
			id: senderID
		},
		message:{
			attachment:{
				type: "image",
				payload: {
					url: 'https://s-media-cache-ak0.pinimg.com/564x/ef/e8/ee/efe8ee7e20537c7af84eaaf88ccc7302.jpg'
				}

			}
		}
	}

	callSendAPI(messageData)
}
//enviar texto plano
function enviarMensajeTexto(senderID, mensaje){
	var messageData = {
		recipient : {
			id: senderID
		},
		message: {
			text: mensaje
		}
	}

	callSendAPI(messageData)
}

//formatear el texto de regreso al cliente

function getMessageCLima(temperatura){
	if(temperatura > 30){
		return "Nos encontramos a " + temperatura +". Hay demasiado calor, comprate una gaseosa :V"
	}else{
		return "Nos encontramos a " + temperatura +" es un bonito dia para salir"
	}
}

//enviar texto en temperatura
function getClima(callback){
	request('http://api.geonames.org/findNearByWeatherJSON?lat=-12.046374&lng=-77.042793&username=eduardo_gpg',
		function(error, response, data){
			if(!error){
				var response = JSON.parse(data)
				var temperatura = response.weatherObservation.temperature
				callback(temperatura)
			}else{
				callback(15) //temperatura por defecto
			}
		})
}

function callSendAPI(messageData){
	//api de facebook
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: APP_TOKEN},
		method: 'POST',
		json: messageData
	},function(error, response, data){
		if(error)
			console.log('No es posible enviar el mensaje')
		else
			console.log('Mensaje enviado')
	})
}

function isContain(texto, word){
	if(typeof texto=='undefined' || texto.lenght<=0) return false
	return texto.indexOf(word) > -1
}