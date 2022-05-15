

const { Pool, Client } = require("pg");

const credentials = {
  user: "ohjvqbnzpcxjcf",
  host: "ec2-52-30-67-143.eu-west-1.compute.amazonaws.com",
  database: "ddagk6kfprjrhl",
  password: "1e5fc901c42fbe47446b48530a1b42f9eab701bce27ec191a47db1fb9d0c9ce4",
  port: 5432,
  ssl: { rejectUnauthorized: false }
};


async function sendQueryToDB(q) {
  //"insert into click_table (id, url, section) values (15, 'ori', 'curie');"
  const client = new Client(credentials);
  await client.connect();
  const now = await client.query(q);
  await client.end();

  return now;
}

// (async () => {
// await clientDemo().then() ;
// })();

//
module.exports.sendQueryToDB = sendQueryToDB

