# Sensorium :two_men_holding_hands: :two_women_holding_hands: :couple: :dancer: :woman: :man: :heartpulse: :sparkling_heart: :sparkles: :astonished: :sunglasses: :heart_eyes: :fireworks:
App's backend logic to connect with people with who you share a lot in common. It's a firebase cloud functions project written in TypeScript for clustering and psycellium magic!

Thank you for your interest in helping this project! You should join our [Slack](https://join.slack.com/t/sense8app/shared_invite/enQtMzA3MzIwMDU0NjQ3LWIzMDA1ZTY4OTczMzJiOTU3ZjkwZGFmNTAzODc1ZjBjOWZjNjc4YmVlMjhjNWI3Zjc4OGIwMmEyZWQwY2ZlYjE) channel about any question that you might have and to collaborate!

### Running the app locally for development :rocket:
As a bit of background, this project uses [Firebase's Cloud Functions](https://firebase.google.com/docs/functions/get-started)

Start by cloning the folder on your system. After cloning it, you will have a folder named ```sensorium-backEnd``` in your working directory. After cloning it, run following commands to initiate and run the app:

```bash
cd sensorium-backEnd
firebase init functions
```
#### Note :exclamation:
Before running ```firebase init functions``` make sure that Firebase is installed and set up on your system. Plus your Google account will also have to be added to the project (which you can request by joining our Slack channel). Read Firebase documentation to see how to [get started with Firebase](https://firebase.google.com/docs/functions/get-started). If Firebase is already installed, you might have to run ```firebase login``` and login with your Google account before running ```firebase init functions```.

* After running ```firebase init functions```, you will have to do following steps:  
	* Select the project **sensorium-76912 (Sensorium)** (if not autoselected)  
	* Choose the language **TypeScript**  
	* Answer **Yes(Y)** to _Do you want to use TSLint to catch probable bugs and enforce style?_
	* Answer **No(N)** to every subsequent file overwrite prompt. We don't want to overwrite any file.
	* Finally answer **Yes(Y)** to _Do you want to install dependencies with npm now?_ This will install all the npm dependencies being used in the project.

Now you are ready to run to project and play around! :feelsgood: :tada:  
Just do:
```bash
cd functions
npm run shell     //starts the app
```
If run successfully, you will get a prompt in the console like: ```firebase >```  
Now you can run Firebase commands! :tada: :tada:

Create your first cluster by calling `clusterCreation()` function with following object as the parameter (make sure to fill in the appropriate values for the keys)
```
{ 
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
"desiredClusters": 
	{ 
	"dateTimeOfBirth": true, 
	"monthAndDay": false, 
	"monthAndYear": false,
	"month": false,
	"skills": false,
	"hobbies": false,
	"interests": false 
	}
}
```
Environment configuration  
`firebase functions:config:set mailjet.id="" mailjet.key=""`

Happy testing! :heart:

If you are stuck anywhere, or have an idea or questions about a feature, contact us on the [Slack](https://join.slack.com/t/sense8app/shared_invite/enQtMzA3MzIwMDU0NjQ3LWIzMDA1ZTY4OTczMzJiOTU3ZjkwZGFmNTAzODc1ZjBjOWZjNjc4YmVlMjhjNWI3Zjc4OGIwMmEyZWQwY2ZlYjE) channel or [email](info@sensorium.online) us!
