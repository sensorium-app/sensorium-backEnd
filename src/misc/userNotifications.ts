import * as mailjet  from 'node-mailjet';

export function sendEmail (emailsAndNames:any[]){

    let requestBody = {
        "Messages":[
            {
                "From": {
                    "Email": "info@sensorium.online",
                    "Name": "Sensorium"
                },
                "To": [
                    {
                        "Email": "leo342135@gmail.com",
                        "Name": "passenger 1"
                    }
                ],
                "TemplateID": 467059,
                "TemplateLanguage": true,
                "Subject": "New sensate on your cluster!",
                "Variables": {
                    "name": "Leo"
                }
            }
        ]
    };

    mailjet.connect('', '');

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