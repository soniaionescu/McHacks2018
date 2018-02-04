var express = require('express');
var bodyParser = require('body-parser');
var unirest = require('unirest');
var app = express();
var globalSpkMessage = "";
var globalSpkRoom = "";
var globalSpkPId = "";
var Myheaders = {'Authorization': 'Bearer ZDRiZDNhMjMtZDc3Ny00YzRjLWI0ODktZmE0ZmU5M2FlMzhmNDdkZTk2MTQtMWU4',
'Content-Type': 'application/json'};
const langword = ["Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azeerbaijani", "Basque", 
                "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chinese (Simplified)", 
                "Chinese (Traditional)", "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", 
                "Esperanto", "Estonian", "Finnish", "French", "Frisian", "Galician", "Georgian", "German", 
                "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", 
                "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", 
                "Kannada", "Kazakh", "Khmer", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latin", "Latvian", 
                "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", 
                "Maori", "Marathi", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Nyanja (Chichewa)", 
                "Pashto", "Persian", "Polish","Portuguese", "Punjabi", "Romanian", "Russian", "Samoan", "Gaelic", 
                "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali", "Spanish", 
                "Sundanese", "Swahili", "Swedish", "Tagalog", "Tajik", "Tamil", "Telugu", "Thai", "Turkish", 
                "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"]
const langcodes = ["af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "zh-CN", 
                "zh-TW", "co", "hr", "cs", "da", "nl", "en", "eo", "et", "fi", "fr", "fy", "gl", "ka", "de", "el",
                "gu", "ht", "ha", "haw", "iw", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jw", "kn", 
                "kk", "km", "ko", "ku", "ky", "lo", "la", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", 
                "mr", "mn", "my", "ne", "no", "ny", "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", 
                "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tl", "tg", "ta", "te", "th", 
                "tr", "uk", "ur", "uz", "vi", "cy", "xh", "yi", "yo", "zu"]


app.use(bodyParser.json());
app.post('/',function(req,res) {
    res.end("ok");
    globalSpkMessage = req.body.data.id;
    // console.log(req.body.data);
    globalSpkRoom = req.body.data.roomId;
    globalSpkPId = req.body.data.personId;
    sparkTranslateMessage();
});

app.listen(8080);
console.log('Translator BOT is Listening !')

function sparkTranslateMessage() {
    const Translate = require('@google-cloud/translate');
    const projectId = 'CiscoSparkTranslatorBot';
        // Instantiates a client
    const translate = new Translate({
        projectId: projectId,
        key: "AIzaSyCu1Dj4MG8c9XC7CXr56zIIzEqGXwoskZ0"
    });

    var UserToSend = "";
    var SpkUserMail = "";
    var input = "";
    var SpkMessage = globalSpkMessage;
    var SpkRoom = globalSpkRoom;
    var SpkPId = globalSpkPId;
    var prepValue = "https://api.ciscospark.com/v1/messages/"+SpkMessage;
    
    unirest.get(prepValue).headers(Myheaders)
    .end(function(response) {
        input = response.body.text;
        SpkUserMail = response.body.personEmail;
        console.log("We got a message from "+SpkUserMail+ " saying: "+input);
        if (SpkUserMail == "translateplease@sparkbot.io") {
            console.log("But as it is coming from the BOT we will not Echo");
            return;
        } 
        else {
            console.log("executing function 2 which is SparkGetUser");
            var prepValue = "https://api.ciscospark.com/v1/people/"+SpkPId;
            unirest.get(prepValue)
            .headers(Myheaders)
            .end(function(response) {
                if(input.indexOf(" tr ") > -1){
                    if(input.indexOf("TranslatorBot") > -1 && input.indexOf("TranslatorBot") < 2){
                        var msg = input.substring(input.indexOf("TranslatorBot")+13, input.indexOf(" tr "));
                    }
                    else{
                        var msg = input.substring(0, input.indexOf(" tr "));
                    }
                    var lang = input.substring(input.indexOf(" tr ") + 4, input.length);
                    if(lang.substring(0) == "\s"){
                        lang = lang.substring(1, lang.length);
                    }
                    if(lang.substring(lang.length) == "\s"){
                        lang = lang.substring(0, lang.length - 1);
                    }
                    if(langcodes.indexOf(lang) > -1){
                        translate
                        .translate(msg, lang)
                        .then(results => {
                            UserToSend = response.body.displayName;  
                                         
                            console.log("Getting user email and it is: "+SpkUserMail+" and the display name is: "+UserToSend);
                            var FinalText = ("Translated (" + langword[langcodes.indexOf(lang)] +  "): " + results[0]);    
                            var prepValue = "https://api.ciscospark.com/v1/messages/";
                            unirest.post(prepValue)
                            .headers(Myheaders)
                            .send({ "roomId": SpkRoom, "text": FinalText })
                            .end(function(response) {
                       console.log("Message sent to the room");
                            });
                        });   
                    }
                    else if(langword.indexOf(lang) > -1){
                        // Use langword
                        translate
                        .translate(msg, langcodes[langword.indexOf(lang)])
                        .then(results => {
                            UserToSend = response.body.displayName;               
                            console.log("Getting user email and it is: "+SpkUserMail+" and the display name is: "+UserToSend);
                            var FinalText = ("Translated (" + lang + "): " + results[0]  + ". \n Next time, you can just use the language code," +
                            " and write ___ tr " +
                            langcodes[langword.indexOf(lang)]);
                            var prepValue = "https://api.ciscospark.com/v1/messages/";
                            unirest.post(prepValue)
                            .headers(Myheaders)
                            .send({ "roomId": SpkRoom, "text": FinalText })
                            .end(function(response) {
                       console.log("Message sent to the room");
                            });
                        });  
                    }
                    else{                        
                            UserToSend = response.body.displayName;               
                            console.log("Getting user email and it is: "+SpkUserMail+" and the display name is: "+UserToSend);
                            var FinalText = string.concat("We don't know that language! Here is a list of our languages: \n",
                            langword.toString());
                            langcodes[langword.indexOf(lang)];
                            var prepValue = "https://api.ciscospark.com/v1/messages/";
                            unirest.post(prepValue)
                            .headers(Myheaders)
                            .send({ "roomId": SpkRoom, "text": FinalText })
                            .end(function(response) {
                       console.log("Message sent to the room");
                            });
                    }
                }
                else{
                    UserToSend = response.body.displayName;               
                    console.log("Getting user email and it is: "+SpkUserMail+" and the display name is: "+UserToSend);
                    var FinalText = ("Haha awesome! I don't really know what you were trying to make me do, but here is a list of" +
                    "languages I can translate to: \n" +
                    langword.toString());
                    langcodes[langword.indexOf(lang)];
                    var prepValue = "https://api.ciscospark.com/v1/messages/";
                    unirest.post(prepValue)
                    .headers(Myheaders)
                    .send({ "roomId": SpkRoom, "text": FinalText })
                    .end(function(response) {
               console.log("Message sent to the room");
                        });
                    }
            });
        };
    });
}


function sparkGetMessage() {
    var prepValue = "https://api.ciscospark.com/v1/messages/"+SpkMessage;
    unirest.get(prepValue).headers(Myheaders)
    .end(function(response) {
        TextToSend = response.body.text;
        SpkUserMail = response.body.personEmail;
        console.log("We got a message from "+SpkUserMail+ " saying: "+TextToSend);
        if (SpkUserMail == "translateplease@sparkbot.io") {
        console.log("But as it is coming from the BOT we will not Echo");
        } else {
            sparkGetUser();
        };
    });
}

function sparkGetUser() {
    console.log("executing function 2 which is SparkGetUser");
    var prepValue = "https://api.ciscospark.com/v1/people/"+SpkPId;
    unirest.get(prepValue)
    .headers(Myheaders)
    .end(function(response) {
        UserToSend = response.body.displayName;
        console.log("Getting user email and it is: "+SpkUserMail+" and the display name is: "+UserToSend);
        sparkPostMessage();
    });
}

function sparkPostMessage() {
    var FinalText = "Hello "+UserToSend+ " "+ "you have sent a message saying: "+TextToSend;
    var prepValue = "https://api.ciscospark.com/v1/messages/";
    unirest.post(prepValue)
    .headers(Myheaders)
    .send({ "roomId": SpkRoom, "text": FinalText })
    .end(function(response) {
        console.log("Message sent to the room");
        process.exit(0);
    });
}
