const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const express = require('express')
const app = express()
app.use(express.json()) //Very important!!! need for yanir post req?
const cors = require('cors')
app.use(cors())

redirectURL = ""

//https://redirectUrl/set_url?url=ngrocUrl
app.get('/set_url', (req, res) => {
    console.log("set url to "+req.query.url);
    redirectURL = req.query.url
    res.send()
});

//https://redirectUrl/get_url
app.get('/get_url', (req, res) => {
    if(redirectURL==""){
        return
    }
    console.log('sending '+redirectURL+ "to "+ req.hostname);
    res.json({"url": redirectURL});
});




app.listen((process.env.PORT || 3000), () => {
    console.log(`Redirect app for NLP listening on port (if local=3000)`)
});
