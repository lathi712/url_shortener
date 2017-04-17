const express = require("express");
const path = require("path");
const mongodb = require("mongodb");
const shortid = require("shortid");
const validurl = require("valid-url");

const app = express();
const port = process.env.PORT || 3000;
const mlabUrl = "mongodb://root:qwerty@ds161950.mlab.com:61950/urls";
const MongoClient = mongodb.MongoClient;

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.resolve(__dirname,'public')));

app.get('/',(req,res)=>{
   res.render('index'); 
});

app.get('/new/:url(*)',(req,res)=>{
    MongoClient.connect(mlabUrl,(err,db)=>{
       if(err){
           console.log('Unable to connect mongodb server',err);
       } else{
           console.log('Connected to mongodb server');
           var collection = db.collection('links');
           var params = req.params.url;
           var local = req.get('host') +"/";
           
           var newLink = (db,callback)=>{
               if(validurl.isUri(params)){
                   var shortcode  = shortid.generate();
                   var newUrl = {url:params,short_url:shortcode};
                   collection.insert([newUrl]);
                   res.json({original_url:params,short_url:local+shortcode});
                  
               }else{
                   res.json({error:"URL format is invalid"});
               }
           };
           newLink(db,()=>{
              db.close(); 
           });
           
       }
    });
});


app.get('/:short',(req,res)=>{
    MongoClient.connect(mlabUrl,(err,db)=>{
        if(err){
            console.log('Mongodb server not connected')
        }else{
            console.log('Mongodb server successfully connected');
            var collection = db.collection('links');
            var params = req.params.short;
            var findLink = (db,callback)=>{
              collection.findOne({"short_url":params},(err,doc)=>{
                  
                 if(doc!=null){
                     console.log(doc.url);
                     res.redirect(doc.url);
                 } else{
                     res.json({error:"No short url found"});
                 }
              });  
            };
            
            findLink(db,()=>{
               db.close(); 
            });
            
            
        }
        
    });
});

app.listen(port,()=>{
    console.log('Server is running on port',port);
});