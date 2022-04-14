const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()) //Very important!!!
const port = 9000

app.post('/', (req, res) => {
    console.log(req.body);
})

function sendHttpPostReq(url,body){
    const xHR = new XMLHttpRequest();
    //TODO: maybe to add function handler for error cases (can help with examples from GitHub)
    //
    xHR.addEventListener( "load", function(event) {
        //alert( event.target.responseText );
        // const obj = JSON.parse(event.target.responseText);
        // var htmlToDisplay = jsonToElement(obj);
        // var t = document.querySelector("iframe").contentWindow.document;
        // t.open();
        // t.write(htmlToDisplay);
        // t.close();
        console.log(event)

        } );

        // Define what happens in case of error
    xHR.addEventListener( "error", function( event ) {
    alert( 'Oops! Something went wrong.' );
    } );


    console.log("send http req to: "+ url)
    xHR.open("POST",url);
    xHR.setRequestHeader('Content-Type', 'application/json');
    xHR.send(JSON.stringify(body));
    //
  
  }

app.listen(port, () => {
    console.log(`Example app listening on port ${port} build3`)
    });

// sendHttpPostReq('http://localhost:8080/informationrequest',{k: "2",clickTime:{startTime:"2022-03-29 16:30:00",
//  endTime:"2022-03-29 16:33:00"}});

 sendHttpPostReq('http://localhost:8080/informationrequest',{k: "2",clickTime:
 {startTime:"2022-03-29 16:30:00"
 }, section : "Black"});