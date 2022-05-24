const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()) //Very important!!!
const port = 9000

app.post('/', (req, res) => {
    console.log(JSON.stringify(req.body));
})

function sendHttpPostReq(url,body){
    const xHR = new XMLHttpRequest();
    xHR.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
       }
    };

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


//example requets for the server:



 sendHttpPostReq('http://localhost:3000/informationrequest',{k: "2",clickTime:
 {startTime:"2022-05-24 16:00:00"
 }});


 sendHttpPostReq('http://localhost:3000/informationrequest',{k: "2",clickTime:
 {startTime:"2022-05-24 15:00:00", endTime:"2022-05-24 16:00:00"
 }});


 sendHttpPostReq('http://localhost:3000/informationrequest',{k: "2",clickTime:
 {startTime:"2022-05-24 15:00:00", endTime:"2022-05-24 17:00:00"
 },id:"333", url:"yarin"});