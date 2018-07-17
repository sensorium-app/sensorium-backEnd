import * as functions from 'firebase-functions';
import * as mailjet  from 'node-mailjet';

export function sendEmail (emailsAndNames:any[]){

    let requestBody = {};
    requestBody['Messages']= [];

    emailsAndNames.forEach((sensateData)=>{
        let message = {
            "From": {
                "Email": "info@sensorium.online",
                "Name": "Sensorium"
            },
            "TemplateID": 467059,
            "TemplateLanguage": true,
            "Subject": "New sensate on your cluster!",
            "Variables": {
                "name": ""
            }
        };

        message['To'] = [
            {
                Email: sensateData.email,
                Name: sensateData.name
            }
        ];
        message.Variables.name = sensateData.name;
        
        requestBody['Messages'].push(message);
    });

    console.log(JSON.stringify(requestBody));

    return new Promise((resolve, reject) =>{
        let id, key;
        try{
            id = functions.config().mailjet.id;
            key = functions.config().mailjet.key;
        }catch(e){
            id = process.env.mailjetid;
            key = process.env.mailjetkey;
        }

        mailjet.connect(id, key)
            .post("send", {'version': 'v3.1'})
            .request(requestBody)
            
            .then((result) => {
                console.log(result.body);
                resolve(result.body);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
}