const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = 7000
app.use(express.json())
app.use(cors())

main_section_bag_of_words = []
// main_section_bag_of_words = [
//     ["אבטיח", "סתם שיט"],
//     ["מלונית", "נרניה", "ארמדילו"],
//     ["מצות", "אישטבח"],
//     ["חצות", "טינהנהני"],
//     ["ליברפול", "מצות", "כדורגל"],
//     ["ליברפול", "מצות", "כדורגל"],
//     ["ליברפול", "כדורגל"]
// ]

function countIntersections(a1, a2) {
    return a1.filter(function (n) {
        return a2.indexOf(n) !== -1;
    }).length;
}

function get_main_order(ner) {
    counters = []
    for (var i = 0; i < main_section_bag_of_words.length; i++) {
        var intersectingCount = countIntersections(ner, main_section_bag_of_words[i]);
        counters.push([intersectingCount, i])
    }
    counters.sort(function (a, b) {
        var aSize = a[0];
        var bSize = b[0];
        var aLow = a[1];
        var bLow = b[1];

        if (aSize == bSize) {
            return (aLow < bLow) ? -1 : (aLow > bLow) ? 1 : 0;
        } else {
            return (aSize < bSize) ? 1 : -1;
        }
    });
    counters_2_return = []
    for (var i = 0; i < counters.length; i++) {
        counters_2_return.push(counters[i][1])
    }
    return counters_2_return
}

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
            // console.log(res)
            let preferences_json = res.data
            let pref_array = preferences_json.preferences
            let my_main_ner = preferences_json.ner
            console.log("my_main_ner", my_main_ner)
            console.log(typeof preferences_json)

            console.log(`pref_array: ${pref_array}`)

            if (main_section_bag_of_words.length == 0) {
                response.send([pref_array, [0, 1, 2, 3, 4, 5, 6]])
                // response.send([pref_array, [1, 0, 2, 3, 4, 5, 6]])
            }else{
            let mainOrder = get_main_order(my_main_ner);
            console.log("mainOrder", mainOrder)
            response.send([pref_array, mainOrder])
            }

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
    res.send("ok")
})

app.post('/creat_user', async (req, res) => {
    // console.log(req.body)
    // let domain_req = req.body.domain
    let domain_req = req.query.domain
    console.log("domain", domain_req)
    preferences_proxy_url = 'https://preferences-db-proxy.herokuapp.com/creat_user'
    let payload = {domain: domain_req};

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