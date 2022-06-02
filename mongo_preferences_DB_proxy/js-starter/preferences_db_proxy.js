const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())
const port = 4000
const { ObjectId } = require('mongodb');
const pass = "Maccabi1977"
var collection;

async function run() {
  try {
       
        await client.connect();
       console.log("Connected correctly to server");
       const db = client.db(dbName);
       // Use the collection "people"
       const col = db.collection(collectionName);
       // Construct a document                                                                                                                                                              
       let personDocument = {
           "name": { "first": "Alan", "last": "Turing" },
           "birth": new Date(1912, 5, 23), // June 23, 1912                                                                                                                                 
           "death": new Date(1954, 5, 7),  // June 7, 1954                                                                                                                                  
           "contribs": [ "Turing machine", "Turing test", "Turingery" ],
           "views": 1250000
       }
       // Insert a single document, wait for promise so we can read it back
       console.log("1")
       const p = await collection.insertOne(personDocument);
       console.log("2")
       // Find one document
       const myDoc = await collection.findOne();
       // Print to the console
       console.log("1")
       console.log(myDoc);
      } catch (err) {
       console.log(err.stack);
      }
}

var clientDB, dbName, collectionName, db, col;
async function connetToDB() {
  const { MongoClient, Int32 } = require("mongodb");
  const url = "mongodb+srv://MaikyG:Maccabi1977@cluster0.47boo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  clientDB = new MongoClient(url);
   // The database to use
  dbName = "Newsflix";
  collectionName = "preferences_col";
  
   try {
  
    await clientDB.connect();
    console.log("conected to db");
    db = clientDB.db(dbName);
    col = db.collection(collectionName);
   }
   catch (err) {
    console.log(err.stack);
  }
  finally {

  }
  }
connetToDB().catch(console.dir);

async function writeToDB(jsonToDB) {
  try {
    const p = await col.insertOne(jsonToDB);
    //debug
    const myDoc = await col.findOne({_id: p.insertedId});
    console.log(myDoc);
    //debug
    return (p.insertedId);
  } catch (err) {

    console.log(err.stack);
    return -1;

}
finally {

  //await clientDB.close();

}
}

async function readFromDB(user_id_to_find) {
  console.log("user_id",parseInt(user_id_to_find))
  try {
    const myDoc = await col.findOne({user_id: parseInt(user_id_to_find)});
    console.log("return",myDoc);
    //debug
    return (myDoc);
  } catch (err) {

    console.log(err.stack);
    return -1;

}
finally {

}
}

async function readFieldFromDB(user_id_to_find, field) {
  //console.log("user_id readFieldFromDB",parseInt(user_id_to_find), field)
  try {
    const myDoc = await col.findOne({user_id: parseInt(user_id_to_find)}, {projection: {_id: 0, [field]: 1}});
    //console.log("return",myDoc);
    //debug
    return (myDoc);
  } catch (err) {

    console.log(err.stack);
    return -1;

}
finally {

}
}

app.get('/get_user', (req, res) => {
  console.log(req.query._id);
  doc_returned = readFromDB(req.query._id).then(function (data) 
    {
      console.log("id of new db tuple is: ",JSON.stringify(data));
      res.send(JSON.stringify(data));
    });
})

app.get('/get_user_sections_counter', (req, res) => {
  console.log(req.query.user_id);
  doc_returned = readFieldFromDB(req.query.user_id, "sections_counter").then(function (data) 
    {
      //console.log("id of new db tuple is: \n",data);
      res.send(data);
    });
})

async function updateDB(update_JSON) {
  console.log("_id",update_JSON._id)
  try {
    var stringId = update_JSON._id
    delete update_JSON._id;
    // var stringId = update_JSON.user_id
    // delete update_JSON.user_id;
    //console.log("after deleting - ", update_JSON);
    //console.log("after deleting - stringId - ",ObjectId(stringId));
    const myDoc = await col.updateOne({'_id':parseInt(stringId)},{$set: update_JSON})

    //console.log("return",myDoc);
    //debug
    return true;
  } catch (err) {
    return false;
    console.log(err.stack);
    return -1;

}
finally {

}
}

app.post('/set_user_sections_counter_and_preferences', (req, res) => {
  //console.log(req.body.sections_counter);
  updateDB(req.body).then(function (data) 
  {
  });
})

app.post('/creat_user', async (req, res) => {
  //console.log(req.body.sections_counter);
  //TODO: set the preferences as the deafult order
  new_user_JSON = { "sections_counter":[0,0,0,0,0],
                    "preferences": [-1,-1,-1,-1,-1],
                    "domain":req.body.domain
                  }
  id = await writeToDB(new_user_JSON)
  res.send(JSON.stringify({_id : id}))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})