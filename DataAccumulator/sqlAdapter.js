const { response } = require('express');
var mysql = require('mysql');
var tableCols= {id:"id",url:"url", section:"section", clickTime:"clickTime"};
const sqlConnector = require('./sqlConnector')

function writeLineToClickTable(id, url, section){
  q= "INSERT INTO click_table (Id, Url, Section, Clicktime) values('"+id +"','"
  +url+"','"
  +section+"',now()) ;"
    sqlConnector.sendQueryToDB(q);
  }


function getKLatestLinesFromClickTable(k){
  var query_result=new Promise((resolve, reject) => {
  sqlConnector.sendQueryToDB("SELECT * FROM click_table order by clickTime DESC LIMIT "+JSON.stringify(k)+";").then(
    function (value) {
      resolve(value.rows);
      }
  )
});
    return query_result;
}

function startAndEndTimeHandling(json){
    var s=""
      if("startTime" in json[tableCols["clickTime"]]){
        s+=" AND "+ tableCols["clickTime"]+" >= \'" + json[tableCols["clickTime"]]["startTime"] + "\'"
      }
      if("endTime" in json[tableCols["clickTime"]]){
        s+=" AND "+tableCols["clickTime"]+" <= \'" + json[tableCols["clickTime"]]["endTime"] + "\'"
      }
    return s
  }

function parsingRequestConditions(json){
    var s=""
    Object.keys(json).forEach(function(field){
        if(field.toString() == "k"){
        }
        else if (field.toString() == tableCols["clickTime"])
        {
          s+=startAndEndTimeHandling(json)
        }
        // else if (field.toString() == "id") !!!was in used before changing id filed - NEED TO BE TESTED
        // {
        //   s+=" AND " + field.toString()+" = "+json[field].toString() 
        // }
        else
        {
          s+=" AND " + field.toString()+" = \'"+json[field].toString()+"\'"
        }
        
      });
    return s;
}

function generalQueryServerRequest(reqJson){
    var query_result=new Promise((resolve, reject) => {
      sqlConnector.sendQueryToDB("SELECT * FROM click_table WHERE 1=1"+parsingRequestConditions(reqJson)
                                        +" order by clickTime DESC LIMIT "+reqJson["k"].toString()+";").then(
                                        function (value) {
                                          resolve(value.rows);
                                          })
    });

    return query_result;

}

//writeLineToClickTable(999,'spor5','green');
module.exports.writeLineToClickTable = writeLineToClickTable

//getKLatestLinesFromClickTable(3);
module.exports.getKLatestLinesFromClickTable = getKLatestLinesFromClickTable

//
module.exports.generalQueryServerRequest = generalQueryServerRequest