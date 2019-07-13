# sensorium
App's Logic to connect with people with who you share a lot in common

It's a firebase cloud functions project for clustering and psycellium magic!

Thank you for your interest in helping this project!

As a bit of background, this project uses Firebase's Cloud Functions:
https://firebase.google.com/docs/functions/get-started

Before clonning the repo on your machine, you should consider a folder structure like this:

/sensorium-backEnd/functions (cloned repo here)

Do these steps beside the functions folder:
firebase login
    With your gmail account
firebase init functions
    In here select the dev firebase project
    It'll tell you to replace some files, indicate NO
    Install the dependencies with npm
    And that should be it!
	
To invoke to functions do it like this:

In a cmd or terminal run:
    "npm run shell", type in something like the following snippet, and happy dev/testing!
	
	clusterCreation({
      "uid": "",
	  "name": "",
	  "lastName": "",
	  "secondLastName":"",
	  "email": "",
	  "gender": "",
	  "dateTimeOfBirth": "",
	  "skills":{},
	  "hobbies": {},
	  "interests":{},
	  "languagesSpoken":{},
	  "desiredClusters": {
		  "dateTimeOfBirth": true,
		  "monthAndDay": false,
		  "monthAndYear": false,
		  "month": false,
		  "skills": false,
		  "hobbies": false,
		  "interests": false
	  }
})

Environment configuration
	firebase functions:config:set mailjet.id="" mailjet.key=""

Please contact us at info@sensorium.online of any questions or issues.

License pending