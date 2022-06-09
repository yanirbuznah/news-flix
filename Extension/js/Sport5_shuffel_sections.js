// Here You can type your custom JavaScript...
//var parent = content.parentNode;
//parent.insertBefore(content, parent.firstChild);
var id = null; // todo: user id should not be hard-coded. Use cookies instead
var sections = ["section section-blue", "section section-red", "section section-orange", "section section-grey", "section section-green"];
var main_order = [8,7,6,5,4,3,2,1,0];


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

function rearrangeMainSection() {
    main_section = document.getElementById("content").getElementsByClassName("row")[0]
    ms_articles_divs = main_section.childNodes[1].children
    console.log("ms_articles_divs", ms_articles_divs)   // esction-divider-section-divider...
    console.log("ms_articles_divs.length" + ms_articles_divs.length)
    filtered_divider = []
    filtered_articales = []
    for (var i = 0; i < ms_articles_divs.length; i++) {
        if (ms_articles_divs[i].className == "divider") {
            filtered_divider.push(ms_articles_divs[i])
            filtered_articales.push(ms_articles_divs[i].previousElementSibling)
        }
    }
    console.log("filtered_centers after:")
    console.log(filtered_divider)
    console.log("filtered_articales after:")
    console.log(filtered_articales)

    for (var i = 0; i < main_order.length; i++) {
        index = i
        item = main_order[i]
        var current_article = filtered_articales[item];
        var current_divider = filtered_divider[index];
        console.log("current_article after:"+(item))
        console.log(current_article)
        console.log("current_divider after:"+(index))
        console.log(current_divider)
        current_divider.parentNode.insertBefore(current_article ,current_divider)
    }

    // main_order.forEach(function (item, index) {
    //     var current_article = filtered_articales[item];
    //     var current_divider = filtered_divider[index];
    //     console.log("current_article after:"+(item))
    //     console.log(current_article)
    //     console.log("current_divider after:"+(index))
    //     console.log(current_divider)
    //     current_divider.parentNode.insertBefore(current_article ,current_divider)
    // });
    console.log("finish")
    // for (var i = 0; i < filtered_divider.length; i++) {
    //     if (ms_articles_divs[i].className == "divider") {
    //         filtered_divider.push(ms_articles_divs[i])
    //     }
    // }
    // TODO: continue from here
    // all divs contain space for ads, but some
    //ms_articles_divs[2]=ms_articles_divs[4]
    // for (i = 0; i < ms_articles_divs.length - 1; i += 2) {
    //     article_div = ms_articles_divs[i]
    //     console.log("MG outerText::::::::::" + ms_articles_divs[i].outerText)
    //     ms_articles_divs[i].outerText = "Tom Magdaci"
    //     // todo: remove first inner div (ad div) from each article div
    //     // understand how to do so (changing dom element is different than changing js array)
    // }
}

function rearrangePage() {
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

    rearrangeMainSection()
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
            order1 = this.responseText
            order1 = JSON.parse(order1)
            order = order1[0]
            
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
    url = "https://reorder.herokuapp.com/"
    xhttp.open("GET", url + "?" + params, false);

    // send Get request
    xhttp.send()
    console.log(" send finished ")
}


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
            url = "https://reorder.herokuapp.com/creat_user"
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
                clicked_element = this
                console.log("attaching click event listener")
                console.log("this:", this)
                var href = $(clicked_element).attr("href");
                alert("You're trying to go to " + href + "from " + section);

                // title = this.text
                // console.log(`title: ${title}`)
                class_name = clicked_element.parentElement.className;
                tag_name = clicked_element.parentElement.tagName;
                if (class_name == "writer" || tag_name == "SPAN") {
                    clicked_element = clicked_element.parentElement
                }
                console.log("class name:", class_name)
                var parent = clicked_element.parentElement.parentElement;
                console.log("parent: ", parent)
                console.log("p_children list: ", parent.getElementsByTagName("p"))
                subtitle = parent.getElementsByTagName("p")[0].outerText;
                console.log("subtitle", subtitle)

                console.log("h2_children list:", parent.getElementsByTagName("h2"))
                title = parent.getElementsByTagName("h2")[0].outerText;
                console.log("title:", title)

                titles_text = title + "\n" + subtitle
                // console.log("titles text:", titles_text)

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
                params = "id=" + id + "&section=" + section + "&url=" + href + "&clickedheader=" + titles_text;
                console.log(`params: ${params}`)
                url = "https://limitless-sea-45427.herokuapp.com/clickwrite"
                xhttp.open("GET", url + "?" + params);

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

// TODO: understand how to reorder
// document.getElementById("content").getElementsByClassName("row")[0]
// real articles contain "h2", ads don't
//