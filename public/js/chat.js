const socket = io()


//Elements

const $messageform = document.querySelector("#message-form")
const $messageforminput = $messageform.querySelector("input")
const $messageformbutton = $messageform.querySelector("button")


const $sendlocationbutton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const { username , room } = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}



socket.on('message',(message)=>{
    console.log("Mr Awais",message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('locationMessage',(url)=>{
    console.log("Your Location is:",url);
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})



$messageform.addEventListener('submit',(e)=>{

    e.preventDefault()

    $messageformbutton.setAttribute('disabled','disabled')

    const message =  e.target.elements.message.value
    socket.emit("sendMessage",message,(error)=>{
        $messageformbutton.removeAttribute('disabled')
        $messageforminput.value=''
        $messageforminput.focus()
        if (error){
        return console.log(error)} 
        console.log("the message was delivered");
    })
})

$sendlocationbutton.addEventListener('click',()=>{
    $sendlocationbutton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert("your browser doesnt support this functionality")
    }

        navigator.geolocation.getCurrentPosition((position)=>{
            
            socket.emit("sendLocation", {latitude: position.coords.latitude,longitude:position.coords.longitude},()=>{
                console.log("location delivered");
                $sendlocationbutton.removeAttribute('disabled')
            })
        })
    })

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }
})