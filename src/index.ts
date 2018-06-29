import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import './misc/userNotifications';

admin.initializeApp();
const db = admin.firestore();

export const clusterCreation = functions.firestore
  .document('sensates/{id}')
  .onCreate((snap, context) => {

    const newSensateId = context.params.id;
    console.log(newSensateId);

    return new Promise((resolve, reject) =>{
        const sensate = snap.data();
        console.log('sensateData',sensate);

        const sensateDesiredClusters = sensate.desiredClusters;
        //const sensatesLanguages = sensate.languagesSpoken;
        const sensatesDoB = sensate.dateTimeOfBirth;
        const sensatesSkills = sensate.skills;
        const sensatesHobbies = sensate.hobbies;
        const sensatesInterests = sensate.interests;
        //const sensatesShowsCharacter = sensate.showsCharacter;

        //Fix this query aggregation issue
        //let clustersRef = db.collection('clusters');
        let clustersRef;

        //Aggregate the query
        if(sensateDesiredClusters['dateTimeOfBirth']){
            let dob = moment(sensatesDoB);
            
            console.log(extractDateFromDate(dob));

            clustersRef = db.collection('clusters')
                .where('type','==','dateTimeOfBirth')
                .where('typeData', '==', extractDateFromDate(dob));
        }
        if(sensateDesiredClusters['monthAndDay']){
            let dob = moment(sensatesDoB);
            //Fix this query aggregation issue
            /*clustersRef
                .where('type','==','monthAndDay')
                .where('typeData', '==',  extractMonthAndDayFromDate(dob));*/
        }
        if(sensateDesiredClusters['monthAndYear']){
            let dob = moment(sensatesDoB);
            //Fix this query aggregation issue
            /*clustersRef
                .where('type','==','monthAndYear')
                .where('typeData', '==',  extractMonthAndYearFromDate(dob));*/ 
        }
        if(sensateDesiredClusters['month']){
            let dob = moment(sensatesDoB);
            //Fix this query aggregation issue
            /*clustersRef
                .where('type','==','month')
                .where('typeData', '==', extractMonthFromDate(dob));*/   
        }
        
        clustersRef.get().then((clustersFiltered) => {

            console.log('then de clusters - 59', clustersFiltered.size, JSON.stringify(clustersFiltered.query));

            if(!clustersFiltered.empty){
                console.log(clustersFiltered);
                //add sensate to clusters
                clustersFiltered.forEach((cluster:any) => {
                    const clusterData = cluster.data();
                    console.log(clusterData);
                    const clusterType = clusterData.type;
                    
                    let sensates = clusterData.sensates;

                    updateCluster(cluster.id, clusterType, sensates, newSensateId).then((res)=>{
                        resolve(res);  
                    }).catch((err)=>{
                        reject(err);
                    });

                });
                console.log('Ok, sensate added');
                resolve('Ok, sensate added');
            }else{
                console.log('add cluster 1');
                createCluster(newSensateId, sensate).then((res)=>{
                    resolve(res);
                }).catch((err)=>{
                    console.log(err);
                    reject(err);
                });
            }

        }).catch((err)=>{
            console.log(err);
            reject(err);
        });

    });

});

function updateCluster(clusterId, clusterType, sensates, newSensateId){
    
    return new Promise((resolve, reject) =>{

        console.log('update', clusterType);
        sensates[newSensateId] = true;

        db.collection('clusters').doc(clusterId).update({sensates: sensates}).then((sensateAddedResponse:any)=>{
            console.log('Added to '+clusterType+' cluster', sensateAddedResponse);
            
            Object.keys(sensates).forEach((sensateKey:string)=>{
                if(!sensates[newSensateId]){
                    let sensatesToInform = [];
                    db.collection('sensates').doc(sensateKey).get().then((sensateData:any)=>{
                        
                        sensatesToInform.push({
                            email: sensateData.email,
                            name: sensateData.name
                        });

                    }).catch((errSensate)=>{
                        resolve('Added to '+clusterType+' cluster, but others not informed');
                    });

                    if(sensatesToInform.length>0){
                        //sendEmail(sensatesToInform)
                        sendEmail();
                    }
                }
            });
            
        }).catch((err)=>{
            console.log(err);
            reject(err);
        });
    });
}

function createCluster(newSensateId, sensateData){

    console.log('addCluster begins');
    let sensateInCluster = {};
    sensateInCluster[newSensateId] = true;

    return new Promise((resolve, reject) =>{
        //add clusters
        const sensateDesiredClusters = sensateData.desiredClusters;

        console.log(sensateDesiredClusters);

        Object.keys(sensateDesiredClusters).forEach((desiredCluster)=>{

            console.log(desiredCluster);

            if(sensateDesiredClusters[desiredCluster] == true){
                let clusterTypeData;

                if(desiredCluster === 'dateTimeOfBirth'){
                    console.log('add dateTimeOfBirth');
                    console.log(sensateData.dateTimeOfBirth);
                    clusterTypeData = extractDateFromDate(sensateData.dateTimeOfBirth);
                }
                if(desiredCluster === 'monthAndDay'){
                    console.log('add monthAndDay');
                    clusterTypeData = extractMonthAndDayFromDate(sensateData.dateTimeOfBirth);
                }
                if(desiredCluster === 'monthAndYear'){
                    console.log('add monthAndYear');
                    clusterTypeData = extractMonthAndYearFromDate(sensateData.dateTimeOfBirth);
                }
                if(desiredCluster === 'month'){
                    console.log('add month');
                    clusterTypeData = extractMonthFromDate(sensateData.dateTimeOfBirth);
                }

                const newClusterType = {
                    id: new Date().getTime(),
                    name: '',
                    type: desiredCluster,
                    typeData: clusterTypeData,
                    sensates: sensateInCluster,
                    posts: {},
                    creation: new Date(),
                    languages: sensateData.languagesSpoken
                };

                console.log('newClusterType', newClusterType);

                db.collection('clusters').add(newClusterType).then((responseAdd)=>{
                    console.log('Cluster created', responseAdd);
                    resolve('Cluster created');
                }).catch((err)=>{
                    console.log(err);
                    reject(err);
                });
            }
            else{
                console.log('ignore', desiredCluster);
            }
        });
        
    });
}

function sendEmail (){
    const mailjet = require ('node-mailjet')
		.connect('6650361de0011b7c50b57bb3b70a12b8', 'f0ad1e8691024a4262f429797ce4eba5')
	const request = mailjet
		.post("send", {'version': 'v3.1'})
		.request({
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
		})
	request
		.then((result) => {
			console.log(result.body)
		})
		.catch((err) => {
			console.log(err)
		})
}

function extractDateFromDate(date){
    let dateToProcess = moment(date);
    return dateToProcess.year() + '-' + dateToProcess.month() + '-' + dateToProcess.date();
}

function extractMonthAndDayFromDate(date){
    let dateToProcess = moment(date);
    return dateToProcess.month() + '-' + dateToProcess.date();
}

function extractMonthAndYearFromDate(date){
    let dateToProcess = moment(date);
    return dateToProcess.year() + '-' + dateToProcess.month();
}

function extractMonthFromDate(date){
    let dateToProcess = moment(date);
    return dateToProcess.month();
}