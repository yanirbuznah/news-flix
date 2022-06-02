// Here You can type your custom JavaScript...
//var parent = content.parentNode;
//parent.insertBefore(content, parent.firstChild);
var id = null; // todo: user id should not be hard-coded. Use cookies instead
var sections = ["section section-blue", "section section-red", "section section-orange", "section section-grey", "section section-green"];


function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function orderSectionsByOrderList(order_list) {
    console.log("order list:", order_list)
    ordered_sections = []
    list_len = order_list.length
    for (var i = 0; i < list_len; i++) {
        console.log("from orderSectionsByOrderList", typeof order_list[i])
        if (order_list[i] == -1) {
            ordered_sections = sections
            break
        }
        ordered_sections.push(sections[order_list[i]])
    }
    console.log("ordered sections", ordered_sections)
    sections = ordered_sections
}

function rearrangePage() {

    console.log("Jqueryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy333")
    // console.log(content.find_element_by_xpath('//div[@id="content"]/div'));
    // divs = content.getElementsByTagName("div");
    var content = document.getElementById('content');
    console.log(content.getElementsByClassName("center"))
    console.log(content)
    center_divs = content.getElementsByClassName("center")
    filtered_centers = []
    for (var i = 0; i < center_divs.length; i++) {
        if (center_divs[i].className == "center") {
            filtered_centers.push(center_divs[i])
        }
    }
    console.log(filtered_centers)

    sections.forEach(function (item, index) {
        console.log(item);
        var j = 0
        var current_section = content.getElementsByClassName(item);
        for (var i = 0; i < current_section.length; i++) {
            // Only if there is only single class
            if (current_section[i].className == item) {
                console.log(current_section[i]);
                // content.insertBefore(current_section[i], content.firstChild);
                content.insertBefore(current_section[i], filtered_centers[j]);
                j++;
                break;
            }
        }
    });
}

var ready_2_shuffle = false;

function connectServer(uid) {
    console.log("******CONNECTING SERVER******")
    var xhttp = new XMLHttpRequest();
    // set callback for when connection with preferences server is ready
    xhttp.onreadystatechange = function () {
        console.log("readystate", this.readyState)
        console.log("status: ", this.status)
        if (this.readyState == 4 && this.status == 200) {
            console.log("finished connecting server")

            // reorder sections acoording to the server response
            var sections_order = JSON.parse(this.responseText)
            console.log(`response text: ${sections_order}`)
            // order = sections_order.preferences
            order = this.responseText
            order = JSON.parse(order)
            console.log(`typeof order: ${typeof order}`)
            console.log(`responseText: ${order}`)

            // convert order to indices list
            indices_list = []
            for (var i = 0; i < order.length; i++) {
                indices_list.push(order[i])
            }
            console.log(`indices_list: ${indices_list}`)

            // orderSectionsByOrderList(indices_list)  // update sections' order
            orderSectionsByOrderList(order)  // update sections' order

            // rearrange page according to the updated order,
            // or set ready_2_shuffle to be true in case document
            // loading isn't finished yet
            if (!ready_2_shuffle) {
                ready_2_shuffle = true;

            } else {
                rearrangePage()
            }
        }
    }

    // prepare requset to the server
    console.log(`uid= ${uid}`)
    params = "user_id=" + uid + "&domain=" + document.location.host;  // todo: user_id not hardcoded
    url = "http://127.0.0.1:7000"
    xhttp.open("GET", url + "?" + params, false);

    // send Get request
    xhttp.send()
    console.log(" send finished ")
}

// function getRandomToken() {
//     // E.g. 8 * 32 = 256 bits token
//     var randomPool = new Uint8Array(32);
//     crypto.getRandomValues(randomPool);
//     var hex = '';
//     for (var i = 0; i < randomPool.length; ++i) {
//         hex += randomPool[i].toString(16);
//     }
//     console.log(`id token = ${hex}`)
//     return hex;
// }

// async function create_new_user() {
//     var xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function () {
//         console.log("readystate", this.readyState)
//         console.log("status: ", this.status)
//         if (this.readyState == 4 && this.status == 200) {
//             console.log("finished connecting server from create_new_user()")
//             new_id = parseInt(xhr.responseText)
//
//         }
//     }
//
//     url = "http://127.0.0.1:3000/create_user"
//     xhr.open("POST", url + "?" + params);
//     await xhr.send()
//     console.log("request sent from create_new_user()");
// }

(function get_user_id() {
    console.log("get_user_id");
    // // *** clear id from cache *** //
    // chrome.storage.sync.clear(function () {
    //     console.log("removed last id")
    // });
    chrome.storage.sync.get('userid', function (items) {
        var userid = items.userid;
        if (userid) {   // existing user
            console.log(`userid=${userid}`)
            connectServer(userid)
        } else { // new user - generate id and create document in the DB
            console.log(`no user id yet`)
            // create_new_user().then(function (data) {
            //     console.log(data)
            //     userid = data;
            //     // userid = getRandomToken(); // TODO: if user has no ID yet, send an http request
            //     console.log(`the new user id ${userid}`)
            //     chrome.storage.sync.set({userid: userid}, function () {
            //         connectServer(userid)
            //     });
            // });
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                console.log("readystate", this.readyState)
                console.log("status: ", this.status)
                if (this.readyState == 4 && this.status == 200) {
                    console.log("finished connecting server from create_new_user()")
                    console.log(this.responseText)
                    new_id = this.responseText
                    console.log(`the new user id ${new_id}`)
                    chrome.storage.sync.set({userid: new_id});
                }
            }
            domain = document.location.host
            // domain = "www.sport5.co.il"
            console.log(`domain: ${domain}`)
            url = "http://127.0.0.1:7000/creat_user"
            // url = "http://127.0.0.1:5000"   // TODO: test with real server
            xhr.open("POST", url + '?' + 'domain=' + domain);
            xhr.send()
            console.log("request sent from create_new_user()");
        }
    })
})()


$(document).ready(function () {
    var content = document.getElementById('content');
    console.log("location:", document.location.host)

    // track clicks
    console.log("sections:", sections)
    sections.forEach(function (section) {
        console.log("section:", section)
        curr_section = content.getElementsByClassName(section)
        $(curr_section).on("click", "a", async function () {
                //this == the link that was clicked
                console.log("attaching click event listener")
                var href = $(this).attr("href");
                alert("You're trying to go to " + href + "from section " + section);

                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    console.log("readystate", this.readyState)
                    console.log("status: ", this.status)
                    if (this.readyState == 4 && this.status == 200)
                        console.log("finished connecting server")
                }

                var p = new Promise(function (resolve, reject) {
                    chrome.storage.sync.get({"userid": true}, function (items) {
                        resolve(items.userid);
                    })
                });
                id = await p;
                console.log(`id after async ${id}`);
                heb_id = "שדגכדגכ"
                params = "id=" + id + "&section=" + section + "&url=" + href + "&clickedheader=" + "כותרת מרגשת";
                // params = "id=" + heb_id + "&section=" + section + "&url=" + href;

                // params = "user_id=99&domain=d&section=s&href=h"
                console.log(`params: ${params}`)
                // url = "http://127.0.0.1:5076/clickwrite"
                url = "https://limitless-sea-45427.herokuapp.com/clickwrite"
                xhttp.open("GET", url + "?" + params);


                // xhttp.open("GET","http://localhost:5076/id=99&domain=d&section=s&href=h");
                // xhttp.open("GET", "http://127.0.0.1:5076/clickwrite?id=99&domain=d&section=s&href=h", true);

                // send Get requeset
                xhttp.send()
                console.log("request sent");
            }
        );
    })

    // rearrange page
    if (!ready_2_shuffle) {
        ready_2_shuffle = true;
    } else {
        rearrangePage()
    }
    console.log("finished document ready fucntion")
});