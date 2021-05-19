const socket=io();

// elements
const messageForm=document.querySelector('#message-form');
const messageFormInput=messageForm.querySelector('input');
const messageFormButton=messageForm.querySelector('button');
const sendLocation=document.querySelector('#send-location');
const messages=document.querySelector('#messages');

// templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationTemplate=document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoScroll=()=>{
    //new message element
    const newMessage=messages.lastElementChild

    //height of the new message
    const newMessageStyles=getComputedStyle(newMessage);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=newMessage.offsetHeight+newMessageMargin;

    // const visible height
    const visibleHeight=messages.offsetHeight;

    // height of messages container
    const containerHeight=messages.scrollHeight;

    // how far have i scrolled?
    const scrollOffset=messages.scrollTop+visibleHeight;

    if(containerHeight-newMessageHeight <= scrollOffset){
        messages.scrollTop=messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    });
    messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('locationMessage',(location)=>{
    const html=Mustache.render(locationTemplate,{
        username:location.username,
        location:location.link,
        createdAt:moment(location.createdAt).format('hh:mm a')
    });
    messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html;
})

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    // disable
    messageFormButton.setAttribute('disabled','disabled');
    message=messageFormInput.value;
    messageFormInput.value="";
    messageFormInput.focus();
    // enable
    messageFormButton.removeAttribute('disabled');
    socket.emit('sendMessage',message,(error)=>{
        if(error){
            return console.log(error);
        }
        console.log('The message was delivered ');
    });
})

sendLocation.addEventListener('click',()=>{
    // disable
    sendLocation.setAttribute('disabled','disabled');

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log("Location Shared");
            sendLocation.removeAttribute('disabled');
        });
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href='/';
    }
});