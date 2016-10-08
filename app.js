const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const APP_TOKEN = 'EAAQu2RU44mgBAElNh4Eu5e7T6w13MFawgjp5l0R5kgxV7xNzGmBAdYjrdsOeVMBKRemQbJBJiHFPXwgj6WMaRxPXVZC0nL9uU1AN4QZCJZAdTlOZB5WV4MGVGB8y6zZAL3oho3dfptW6FDwtC3FveKN2TJ0oCuRHevUVgjZARxWwZDZD'

var app = express()

app.use(bodyParser.json())

app.listen(3000,function(){
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
		mensaje = 'solo se repetir las cosas T_T '+ messageText
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
	return texto.indexOf(word) > -1
}