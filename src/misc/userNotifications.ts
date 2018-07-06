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

    mailjet.connect(functions.config().mailjet.id, functions.config().mailjet.key);

    return new Promise((resolve, reject) =>{
        const request = mailjet
            .post("send", {'version': 'v3.1'})
            .request(requestBody);
            
        request.then((result) => {
            console.log(result.body);
            resolve(result.body);
        })
        .catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}