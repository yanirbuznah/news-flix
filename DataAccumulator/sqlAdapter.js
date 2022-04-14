const { response } = require('express');
var mysql = require('mysql');
var tableCols= {id:"id",url:"url", section:"section", clickTime:"clickTime"};
//const { stringify } = require('querystring');
function openConnectionAndQueryFromSQLDB(query,queryResultHandler){
    //Debugging:
    var con = mysql.createConnection({
        port: "3306",
        user: "root",
        database: "clickdocumentation",
        password: "tomtom9"
    });
    //While working in container:
    // var con = mysql.createConnection({
    //     host: "host.docker.internal",
    //     port: "3306",
    //     user: "root",
    //     database: "clickdocumentation",
    //     password: "tomtom9"
    // });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!"); //deleteme
        con.query(query, queryResultHandler);

    // con.end(function(err){
    //             if(err){
    //                 throw err;
    //             }
    //             console.log('Close the database connection');
    // })

});
    
}

function writeLineToClickTable(id, url, section){
    openConnectionAndQueryFromSQLDB("INSERT INTO click_table values("+JSON.stringify(id) +","
                                        +JSON.stringify(url) +","
                                        +JSON.stringify(section) +",now()) ;",
                                    function (err, result) {
                                            if (err) throw err;
                                            console.log("1 record inserted");
                                            });

  }


function getKLatestLinesFromClickTable(k){
    var query_result=new Promise((resolve, reject) => {
        openConnectionAndQueryFromSQLDB("SELECT * FROM click_table order by clickTime DESC LIMIT "+JSON.stringify(k)+";",
        function (err, result) {
            if (err) throw err;
            //console.log(result);
            resolve(result);
            })
    });
    //purpose:
    //return generalQueryServerRequest({k:k})

    //This function returns Promise!
    return query_result;
}

function startAndEndTimeHandling(json){
    var s=""
      if("startTime" in json[tableCols["clickTime"]]){
        s+= tableCols["clickTime"]+" >= \'" + json[tableCols["clickTime"]]["startTime"] + "\' AND "
      }
      if("endTime" in json[tableCols["clickTime"]]){
        s+=tableCols["clickTime"]+" <= \'" + json[tableCols["clickTime"]]["endTime"] + "\' AND "
      }
    return s
  }

function parsingRequestConitions(json){
    //TO DO: need to check the parsing .
    //need to add special case for starting and end time
    var s=""
    Object.keys(json).forEach(function(field){
        if(field.toString() == "k"){
        }
        else if (field.toString() == tableCols["clickTime"])
        {
          s+=startAndEndTimeHandling(json)
        }
        else if (field.toString() == "id")
        {
          s+=field.toString()+" = "+json[field].toString() + " AND "
        }
        else
        {
          s+=field.toString()+" = \'"+json[field].toString() + "\' AND "
        }
        
      });
    s=s.slice(0,-4)
    console.log(s);
    return s;
}

function generalQueryServerRequest(reqJson){
    var query_result=new Promise((resolve, reject) => {
        openConnectionAndQueryFromSQLDB("SELECT * FROM click_table WHERE "+parsingRequestConitions(reqJson)
                                        +" order by clickTime DESC LIMIT "+reqJson["k"].toString()+";",
        function (err, result) {
            if (err) throw err;
            //console.log(result);
            resolve(result);
            })
    });

    //This function returns Promise!
    return query_result;

}

//generalQueryServerRequest({id : 1, url : "sport", clickTime: {startTime:"2022"}})

//writeLineToClickTable(999,'spor5','green');
module.exports.writeLineToClickTable = writeLineToClickTable

//getKLatestLinesFromClickTable(3);
module.exports.getKLatestLinesFromClickTable = getKLatestLinesFromClickTable

//
module.exports.generalQueryServerRequest = generalQueryServerRequest