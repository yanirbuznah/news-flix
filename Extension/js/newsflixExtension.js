var id = null;
var sections = ["section section-blue", "section section-red", "section section-orange", "section section-grey", "section section-green"];
var main_order = [6, 5, 4, 3, 2, 1, 0];

/**
 *
 * @param order_list - list determining the new order of the sections.
 * order_list[i] = x means x should be the i-th section
 * @description changes the sections' order list according to the given order list
 */
function orderSectionsByOrderList(order_list) {
    ordered_sections = []
    list_len = order_list.length
    for (var i = 0; i < list_len; i++) {
        if (order_list[i] == -1) {
            ordered_sections = sections
            break
        }
        ordered_sections.push(sections[order_list[i]])
    }
    sections = ordered_sections
}

function rearrangeMainSection() {
    main_section = document.getElementById("content").getElementsByClassName("row")[0]
    ms_articles_divs = main_section.childNodes[1].children
    // console.log("ms_articles_divs", ms_articles_divs)   // esction-divider-section-divider...
    // console.log("ms_articles_divs.length" + ms_articles_divs.length)
    filtered_divider = []
    filtered_articles = []
    for (var i = 0; i < ms_articles_divs.length; i++) {
        if (ms_articles_divs[i].className == "divider") {
            filtered_divider.push(ms_articles_divs[i])
            filtered_articles.push(ms_articles_divs[i].previousElementSibling)
        }
    }
    // console.log("filtered_centers after:")
    // console.log(filtered_divider)
    // console.log("filtered_articles after:")
    // console.log(filtered_articles)

    for (var i = 0; i < main_order.length; i++) {
        index = i
        item = main_order[i]
        var current_article = filtered_articles[item];
        var current_divider = filtered_divider[index];
        // console.log("current_article after:" + (item))
        // console.log(current_article)
        // console.log("current_divider after:" + (index))
        // console.log(current_divider)
        current_divider.parentNode.insertBefore(current_article, current_divider)
    }
}

function rearrangePage() {
    var content = document.getElementById('content');
    // console.log(content.getElementsByClassName("center"))
    // console.log(content)
    center_divs = content.getElementsByClassName("center")
    filtered_centers = []
    for (var i = 0; i < center_divs.length; i++) {
        if (center_divs[i].className == "center") {
            filtered_centers.push(center_divs[i])
        }
    }
    // console.log(filtered_centers)
    // reorder section according to the sections list
    sections.forEach(function (item, index) {
        // console.log(item);
        var j = 0
        var current_section = content.getElementsByClassName(item);
        for (var i = 0; i < current_section.length; i++) {
            // Only if there is only single class
            if (current_section[i].className == item) {
                // console.log(current_section[i]);
                // content.insertBefore(current_section[i], content.firstChild);
                content.insertBefore(current_section[i], filtered_centers[j]);
                j++;
                break;
            }
        }
    });
    // after sections rearrangement, handle the inner  rearrangement of the main section
    rearrangeMainSection()
}

var ready_2_shuffle = false;

function connectPreferncesServer(uid) {
    // console.log("******CONNECTING SERVER******")
    var xhttp = new XMLHttpRequest();
    // set callback for when connection with preferences server is ready
    xhttp.onreadystatechange = function () {
        // console.log("readystate", this.readyState)
        // console.log("status: ", this.status)
        if (this.readyState == 4 && this.status == 200) {
            // console.log("finished connecting server")

            // reorder sections according to the server response
            var sections_order = JSON.parse(this.responseText)
            order_instructions = JSON.parse(this.responseText)
            // extract sections order and main-section inner order of this user from the response
            sections_order = order_instructions[0]
            main_order = order_instructions[1]

            orderSectionsByOrderList(sections_order)  // update sections' order

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
    // console.log(`uid= ${uid}`)
    params = "user_id=" + uid + "&domain=" + document.location.host;
    url = "https://reorder.herokuapp.com/"
    // url = "http://127.0.0.1:7000"
    xhttp.open("GET", url + "?" + params, false);

    // send Get request
    xhttp.send()
    // console.log(" send finished ")
}

(function get_user_id() {
    // console.log("get_user_id");
    // // *** clear id from cache *** //
    // chrome.storage.sync.clear(function () {
    //     // console.log("removed last id")
    // });
    chrome.storage.sync.get('userid', function (items) {
        var userid = items.userid;
        if (userid) {   // existing user
            // console.log(`userid=${userid}`)
            connectPreferncesServer(userid)
        } else { // new user - generate id and create a new record in the DB
            // console.log(`no user id yet`)
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                // console.log("readystate", this.readyState)
                // console.log("status: ", this.status)
                if (this.readyState == 4 && this.status == 200) {
                    // console.log("finished connecting server from create_new_user()")
                    // console.log(this.responseText)
                    new_id = this.responseText
                    // console.log(`the new user id ${new_id}`)
                    chrome.storage.sync.set({userid: new_id});
                }
            }
            domain = document.location.host
            // domain = "www.sport5.co.il"
            // console.log(`domain: ${domain}`)
            url = "https://reorder.herokuapp.com/creat_user"
            // url = "http://127.0.0.1:5000"
            xhr.open("POST", url + '?' + 'domain=' + domain);
            xhr.send()
            // console.log("request sent from create_new_user()");
        }
    })
})()

$(document).ready(function () {
    var content = document.getElementById('content');

    // track clicks
    sections.forEach(function (section) {
        // console.log("section:", section)
        curr_section = content.getElementsByClassName(section)
        /*
        adding click event listener to report from which section the click event occurred +
        the title and the subtitle of the clicked article
        */
        $(curr_section).on("click", "a", async function () {
                //this == the link that was clicked
                clicked_element = this
                // console.log("attaching click event listener")
                // console.log("this:", this)
                var href = $(clicked_element).attr("href");
                // alert("You're trying to go to " + href + "from " + section);

                class_name = clicked_element.parentElement.className;
                tag_name = clicked_element.parentElement.tagName;
                if (class_name == "writer" || tag_name == "SPAN") {
                    // go up one more level
                    clicked_element = clicked_element.parentElement
                }
                // console.log("class name:", class_name)
                var parent = clicked_element.parentElement.parentElement;
                // console.log("parent: ", parent)
                // console.log("p_children list: ", parent.getElementsByTagName("p"))
                subtitle = parent.getElementsByTagName("p")[0].outerText;
                // console.log("subtitle", subtitle)

                // console.log("h2_children list:", parent.getElementsByTagName("h2"))
                title = parent.getElementsByTagName("h2")[0].outerText;
                // console.log("title:", title)

                titles_text = title + "\n" + subtitle
                // // console.log("titles text:", titles_text)

                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    // console.log("readystate", this.readyState)
                    // console.log("status: ", this.status)
                    // if (this.readyState == 4 && this.status == 200)
                    // console.log("finished connecting server")
                }

                var p = new Promise(function (resolve, reject) {
                    chrome.storage.sync.get({"userid": true}, function (items) {
                        resolve(items.userid);
                    })
                });
                id = await p;
                // console.log(`id after async ${id}`);
                params = "id=" + id + "&section=" + section + "&url=" + href + "&clickedheader=" + titles_text;
                // console.log(`params: ${params}`)
                url = "https://limitless-sea-45427.herokuapp.com/clickwrite"
                xhttp.open("GET", url + "?" + params);

                // send Get requeset
                xhttp.send()
                // console.log("request sent");
            }
        );
    })

    // rearrange page
    if (!ready_2_shuffle) {
        ready_2_shuffle = true;
    } else {
        rearrangePage()
    }
    // console.log("finished document ready fucntion")
});
