const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const sqlAdapter = require('./sqlAdapter')
const express = require('express')
const app = express()
app.use(express.json()) //Very important!!! need for yanir post req?
const cors = require('cors')
app.use(cors())
// var bodyParser = require('body-parser')
// app.use(bodyParser.urlencoded({ extended: true }));



//LearnModel Parameters
const k=2;
var counter=2;//When debugging mode it start with >0
var timeInterval2MsgForLearnModel=30000
//Container mode
//var urlLearnModel= 'http://host.docker.internal:9000/'; //host.docker.internal – This resolves to the outside host.
//Debugging mode:
var urlLearnModel= 'http://localhost:9000/'; //should be yanir's real url

//url for example: http://localhost:8080/clickwrite?id=100&url=x&section=x 
//x are variables
app.get('/clickwrite', (req, res) => {
    console.log(req.query.id)
    console.log("got http get /clickwrite");
    console.log(`section: ${req.query.section}\nid: ${req.query.id}\nurl: ${req.query.url}`)


    if (req.query.section==undefined || req.query.id==undefined || req.query.url==undefined){
      console.log("missing data for clickwrite table in the http get request");
    }
    else if (req.query.clickedheader==undefined){
      req.query.clickedheader='header was not sent';
    }
    else if(typeof req.query.id != 'string' || typeof req.query.url != 'string' || typeof req.query.section != 'string' || typeof req.query.clickedheader != 'string'){
      console.log("wrong data for clickwrite table in the http get request");
    }
    else if(req.query.id.length>sqlAdapter.idMaxLength || req.query.url.length > sqlAdapter.urlMaxLength
       || req.query.section.length >sqlAdapter.sectionMaxLength || req.query.clickedheader.length > sqlAdapter.clickedheaderMaxLength ){
        console.log("some data passed his length limits");
       }
    else{
      console.log("required data was found")
      console.log(JSON.stringify(req.query.id) + " "+JSON.stringify(req.query.url) + " "+JSON.stringify(req.query.section)+" "+JSON.stringify(req.query.clickedheader));
      sqlAdapter.writeLineToClickTable(req.query.id, req.query.url, req.query.section, req.query.clickedheader);
      counter++;
      if(counter>=k){
        counter=0;
        result_a = sqlAdapter.getKLatestLinesFromClickTable(k);
        result_a.then((value)=>{
          sendHttpPostReq(urlLearnModel,value);
        })
      }
    }
  })


app.listen( 3000, () => {
    console.log(`DataAccumulator app listening on port (if local=3000)`)
    });

function sendHttpPostReq(url,body){
  const xHR = new XMLHttpRequest();
  //TODO: maybe to add function handler for error cases (can help with examples from GitHub)
  //
  console.log("send http req to: "+ url)
  xHR.open("POST",url);
  xHR.setRequestHeader('Content-Type', 'application/json');
  xHR.send(JSON.stringify(body));
  //

}

//Setting task for empty the virtual buffer every timeInterval2MsgForLearnModel time
setInterval(function(){
  //console.log("counter is: "+counter);
  if(counter>0){
    result_b = sqlAdapter.getKLatestLinesFromClickTable(counter);
    result_b.then((value)=>{
      //console.log(value);//DEBUG
      sendHttpPostReq(urlLearnModel,value);
    })
    counter=0;
  }
},timeInterval2MsgForLearnModel);




app.post('/informationrequest', (req, res) => {
  console.log(req.body);
  var result = sqlAdapter.generalQueryServerRequest(req.body);
  result.then((value)=>{
    //console.log(value);//DEBUG 
    res.json(value);
  })
})


//
//

