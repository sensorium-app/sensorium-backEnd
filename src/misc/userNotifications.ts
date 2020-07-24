import * as functions from 'firebase-functions';
import * as mailjet  from 'node-mailjet';
import * as admin from 'firebase-admin';

export function sendEmail (emailsAndNames:any[]){

    let requestBody = {};
    requestBody['Messages']= [];

    emailsAndNames.forEach((sensateData)=>{
        let message = {
            "From": {
                "Email": "help@sensoriumapp.net",
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
                Name: ''
            }
        ];
        message.Variables.name = '';
        
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

/*export function sendPushNotification (fcmTokens, data:any){
    return new Promise((resolve,reject)=>{

        var message = {
        data: data,
        tokens: fcmTokens
        };

        // Send a message to the device corresponding to the provided
        // registration token.
        admin.messaging().sendMulticast(message)
        .then((response) => {
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                    failedTokens.push(fcmTokens[idx]);
                    }
                });
                console.log('List of tokens that caused failures: ' + failedTokens);
            }
            resolve();
        });
    })
}*/