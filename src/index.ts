import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

export const clusterCreation = functions.firestore
  .document('sensates/{id}')
  .onCreate(event => {

    console.log(event.params.id);

    return new Promise((resolve, reject) =>{
        const sensate = event.data.data();
        console.log('sensateData',sensate);

        const sensatesDoB = sensate.dateTimeOfBirth;
        const sensatesLanguages = sensate.languagesSpoken;
        const sensatesHobbies = sensate.hobbies;
        const sensatesInterests = sensate.interests;
        const sensatesSkills = sensate.skills;
        const sensatesShowsCharacter = sensate.showsCharacter;

        db.collection('clusters').get()//filter here
        .then((snapshot) => {

            const clusters = snapshot;

            clusters.forEach((cluster) => {
                const clusterType = cluster.data().type;
                const clusterTypeData = cluster.data().typeData;
                
                //Apply rules for clusterCreation

            });

        });

    });

});