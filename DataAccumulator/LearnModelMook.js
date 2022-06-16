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
    // alert( 'Oops! Something went wrong.' );
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



//https://limitless-sea-45427.herokuapp.com/clickwrite?id=478&url=www.sport5.co.il&section=section%20orange

//  sendHttpPostReq('http://limitless-sea-45427.herokuapp.com/informationrequest',{k: "2",clickTime:
//  {startTime:"2022-05-24 16:00:00"
//  }});


//  sendHttpPostReq('http://limitless-sea-45427.herokuapp.com/informationrequest',{k: "2",clickTime:
//  {startTime:"2022-05-24 15:00:00", endTime:"2022-05-24 16:00:00"
//  }});

//sendHttpPostReq('http://limitless-sea-45427.herokuapp.com/informationrequest',{k: "2",id: "777abc"});


//  sendHttpPostReq('http://limitless-sea-45427.herokuapp.com/informationrequest',{k: "2",clickTime:
//  {startTime:"2022-05-26 15:00:00", endTime:"2022-05-26 15:12:10"
//  },id:"200", url:"doron"});


//debug mode:


//sendHttpPostReq('http://localhost:3000/informationrequest',{k: "2",id: "6298b7bd9d4f0a5cb9c51665"});


//sendHttpPostReq('http://localhost:7000/set_beg_of_words',{beg_of_words: [["tom1","tom2"],["maiky1","maiky2"]]});


sendHttpPostReq('http://localhost:3000/run_ncrf_model',{beg_of_words: [["tom1","tom2"],["maiky1","maiky2"]]});

//