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

    mailjet.connect('6650361de0011b7c50b57bb3b70a12b8', 'f0ad1e8691024a4262f429797ce4eba5');

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