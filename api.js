const mongoose=require('mongoose')
const express=require('express')
const cors=require('cors')
const fs = require('fs')
const config=require('./config.json')

const app=express()

app.use(cors())
app.use(express.json())

app.use(express.urlencoded({extended:false}))


let versions = ['v1'];
for(let v of versions) {
    let p = __dirname+'/src/'+v+'/router/';
    fs.readdirSync(p).forEach(file => {
        if(file.includes('js')) {
            let fn = file.replace('.js','');
            app.use('/'+v+'/'+fn, require(p+fn));
        }
    });
}



mongoose.set('strictQuery', false)
const data=mongoose.connect(config.url) 
if(data!=0){
    console.log('MongoDb connected')
}else{
console.log('MongoDb Not connected')   
}



app.listen(config.port ,function(){
    console.log("port running",config.port)
})
