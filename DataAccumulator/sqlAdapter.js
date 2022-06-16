const { response } = require('express');
var mysql = require('mysql');
var tableCols= {id:"id",url:"url", section:"section", clicktime:"clicktime"};
const sqlConnector = require('./sqlConnector')

const idMaxLength=200
const urlMaxLength=200
const sectionMaxLength=100
const clickedheaderMaxLength=500 //because hebrew char is two bytes

function writeLineToClickTable(id, url, section, clickedheader){
  clickedheader = clickedheader.replaceAll("'","''");
  q= "INSERT INTO click_table (id, url, section, clicktime, clickedheader) values('"+id +"','"
  +url+"','"
  +section+"',now(),'"+clickedheader+"');"
    sqlConnector.sendQueryToDB(q);
  }


function getKLatestLinesFromClickTable(k){
  var query_result=new Promise((resolve, reject) => {
  sqlConnector.sendQueryToDB("SELECT * FROM click_table order by clicktime DESC LIMIT "+JSON.stringify(k)+";").then(
    function (value) {
      resolve(value.rows);
      }
  )
});
    return query_result;
}

function startAndEndTimeHandling(json){
    var s=""
      if("starttime" in json[tableCols["clicktime"]]){
        s+=" AND "+ tableCols["clicktime"]+" >= \'" + json[tableCols["clicktime"]]["starttime"] + "\'"
      }
      if("endtime" in json[tableCols["clicktime"]]){
        s+=" AND "+tableCols["clicktime"]+" <= \'" + json[tableCols["clicktime"]]["endtime"] + "\'"
      }
    return s
  }

function parsingRequestConditions(json){
    var s=""
    Object.keys(json).forEach(function(field){
        if(field.toString() == "k"){
        }
        else if (field.toString() == tableCols["clicktime"])
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
                                        +" order by clicktime DESC LIMIT "+reqJson["k"].toString()+";").then(
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

module.exports.idMaxLength = idMaxLength
module.exports.urlMaxLength = urlMaxLength
module.exports.sectionMaxLength = sectionMaxLength
module.exports.clickedheaderMaxLength = clickedheaderMaxLength

