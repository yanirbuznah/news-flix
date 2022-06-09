const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = 7000
app.use(express.json())
app.use(cors())

main_section_bag_of_words = []

app.get('/', (request, response) => {
    let user_id = request.query.user_id
    console.log("user_id", user_id)
    let domain = request.query.domain
    console.log("domain", domain)
    console.log("sending response")

    preferences_proxy_url = 'https://preferences-db-proxy.herokuapp.com/get_user'
    params = "_id=" + user_id;
    // + "&" + "domain=" + domain
    console.log("params", params)
    axios
        .get(preferences_proxy_url + "?" + params)
        .then(res => {
            console.log(res)
            let preferences_json = res.data
            let pref_array = preferences_json.preferences
            let my_main_ner = preferences_json.ner
            console.log(typeof preferences_json)

            console.log(preferences_json){
                response.send([pref_array, [0,1,2,3,4,5,6,7,8]])
            }
            
            if (main_section_bag_of_words.length == 0)

            console.log(`pref_array: ${pref_array}`)
            response.send([pref_array, [1,0,2,3,4,5,6,7,8]])
            console.log("response sent")
        })
        .catch(error => {
            console.error("error in sending the request! status:", error.message)
        })

})

app.post('/set_bag_of_words', async (req, res) => {
    // console.log(req.body)
    // let domain_req = req.body.domain
    //for now we only support main section
    let beg_of_words_req = req.body.main
    console.log("beg_of_words_req", beg_of_words_req)
    main_section_bag_of_words = beg_of_words_req
    // preferences_proxy_url = 'https://preferences-db-proxy.herokuapp.com/creat_user'
    // let payload = { domain: domain_req };

    // let res_id = await axios.post(preferences_proxy_url, payload);
    // // console.log(`res_id: ${res_id}`)

    // // let id = res_id.id;
    // let id = res_id.data._id;

    // console.log(id);
    // // res.send(JSON.stringify({_id : id}))
    // res.send(id)
  })

app.post('/creat_user', async (req, res) => {
    // console.log(req.body)
    // let domain_req = req.body.domain
    let domain_req = req.query.domain
    console.log("domain", domain_req)
    preferences_proxy_url = 'https://preferences-db-proxy.herokuapp.com/creat_user'
    let payload = { domain: domain_req };

    let res_id = await axios.post(preferences_proxy_url, payload);
    // console.log(`res_id: ${res_id}`)

    // let id = res_id.id;
    let id = res_id.data._id;

    console.log(id);
    // res.send(JSON.stringify({_id : id}))
    res.send(id)
  })

app.listen((process.env.PORT || port), () => {
    console.log(`Reorder server listening on port ${port}`)
})