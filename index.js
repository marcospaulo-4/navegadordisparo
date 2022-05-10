const express = require( 'express')
const session = require( 'express-session')
const bodyParser = require("body-parser")


const port = 3000
var path = require( 'path')
const app = express()

var login = "admin"
var password = "12345"


app.use(session({secret:'adadwadawd3143t4134rrdsa'}))
app.use(bodyParser.urlencoded({extends:true }))
app.engine("html",require('ejs').renderFile)
app.set('view engine', "html")
app.use('/public', express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "/views"))



app.post("/",(req,res)=>{
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


app.post("/logado",(req,res,next)=>{
    console.log("fazer disparo")
    console.log(req.body.contatos.sp) //.replaceAll('\n', (",")))
    console.log(req.body.mensagem)

    const numeros = req.body.contatos.replace(/\r?|\r/g, "").split("\n")
    console.log(numeros)
    const mensagem = req.body.mensagem

    for(let numero of numeros){
        console.log(numero,  mensagem)
    }




    // if (req.body.contatos == login && req.body.password == password){
    //     console.log("Logado com sucesso")

    //     req.session.login = login
    //     res.render("logado")

    // }else{
    //     res.render( 'index')
    // }
})
app.get("/logado",(req,res)=>{

    if (req.session.login){
        res.render("logado")
    }
    else {
        res.render( 'index')
    }

})


app.get("/",(req,res)=>{

    if (req.session.login){
        res.redirect("logado")
    }
    else {
        res.render( 'index')
    }

})




app.listen(port,()=> {
    console.log("servidor rodando")
})