const generateMessage=(username,text)=>{
    return {
        text,
        createdAt:new Date().getTime(),
        username:username
    }
}

const generateLocationMessage=(username,url)=>{
    return {
        username:username,
        link:url,
        createdAt:new Date().getTime()
    }
}

module.exports={
    generateMessage,
    generateLocationMessage
}