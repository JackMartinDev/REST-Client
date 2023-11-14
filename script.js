import axios from "axios"
import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import prettyBytes from "pretty-bytes"

const queryParamsContainer = document.querySelector("[data-query-params]")
const requestHeadersContainer = document.querySelector("[data-request-headers]")
const responseHeadersContainer = document.querySelector("[data-response-headers]")
const keyValueTemplate = document.querySelector("[data-key-value-template]")
const form = document.querySelector("[data-form]")

form.addEventListener("submit", (e)=>{
    e.preventDefault();

    axios({
        url: document.querySelector("[data-url]").value,
        method: document.querySelector("[data-method]").value,
        params: keyValuePairsToObjects(queryParamsContainer),
        headers: keyValuePairsToObjects(requestHeadersContainer),
    }).catch(e => e).then(res => {
            document.querySelector("[data-response-section]").classList.remove("d-none")
            updateResponseDetails(res);
            updateResponseEditor(res.data);
            updateResponseHeaders(res.headers);
            console.log(res)
        })
})

function updateResponseEditor(response) {
   document.querySelector("[data-json-response-body]").textContent = JSON.stringify(response, null, 2);
}

function updateResponseHeaders(headers) {
   responseHeadersContainer.innerHTML = "" 
    Object.entries(headers).forEach(([key, value]) => {
        const keyElement = document.createElement("div");
        keyElement.textContent = key;
        responseHeadersContainer.append(keyElement);
        const valueElement = document.createElement("div");
        valueElement.textContent = value;
        responseHeadersContainer.append(valueElement);
    
    })
}

function updateResponseDetails(response) {
    document.querySelector("[data-status]").textContent = response.status;
    document.querySelector("[data-time]").textContent = response.customData.time;
    document.querySelector("[data-size]").textContent = prettyBytes(
        JSON.stringify(response.data).length + JSON.stringify(response.headers).length)
}

document.querySelector("[data-add-query-param-btn]").addEventListener("click", () =>{
    queryParamsContainer.append(createKeyValuePair())
})
document.querySelector("[data-add-request-header-btn]").addEventListener("click", () =>{
    requestHeadersContainer.append(createKeyValuePair())
})

queryParamsContainer.append(createKeyValuePair())
requestHeadersContainer.append(createKeyValuePair())

axios.interceptors.request.use(request => {
    request.customData = request.customData || {}
    request.customData.startTime = new Date().getTime();
    return request;
})

function updateEndTime(response) {
    response.customData = response.customData || {}
    response.customData.time = new Date().getTime() - response.config.customData.startTime;
    return response;
}

axios.interceptors.response.use(updateEndTime, e => {
    Promise.reject(updateEndTime(e.response))
})


function createKeyValuePair() {
    const element = keyValueTemplate.content.cloneNode(true);
    element.querySelector("[data-remove-btn]").addEventListener("click", (e) =>{
        e.target.closest("[data-key-value-pair]").remove()
    })
    return element
}

function keyValuePairsToObjects(container) {
    const pairs = container.querySelectorAll("[data-key-value-pair]")
    return [...pairs].reduce((data,pair) => {
        const key = pair.querySelector("[data-key]").value;
        const value = pair.querySelector("[data-value]").value;
        if(key ==="") return data;
        return {...data, [key]:value}
    }, {})
}
