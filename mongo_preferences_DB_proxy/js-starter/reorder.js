const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = 3000

app.use(cors())

app.get('/', (request, response) => {
    let user_id = request.query.user_id
    console.log("user_id", user_id)
    let domain = request.query.domain
    console.log("domain", domain)
    console.log("sending response")

    preferences_proxy_url = 'http://localhost:4000/get_user'
    params = "user_id=" + user_id;
    // + "&" + "domain=" + domain
    console.log("params", params)
    axios
        .get(preferences_proxy_url + "?" + params)
        .then(res => {
            // console.log(res)
            let preferences_json = res.data
            let pref_array = preferences_json.preferences
            console.log(typeof preferences_json)

            // response.send(sections_order)
            console.log(preferences_json)
            // response.send(preferences_json)
            console.log(`pref_array: ${pref_array}`)
            response.send(pref_array)
            console.log("response sent")
        })
        .catch(error => {
            console.error("error in sending the request! status:", error.response.status)
        })

})

app.listen(port, () => {
    console.log(`Reorder server listening on port ${port}`)
})