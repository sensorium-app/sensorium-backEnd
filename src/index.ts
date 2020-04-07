import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import {sendEmail} from './misc/userNotifications';
import {setClaimToUser} from './security/grantClusterPermissions';
import { user } from 'firebase-functions/lib/providers/auth';
import {deleteCollection} from './deleteSubCollection/deleteSubCollection';

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

export const sensieCreation = functions.firestore
  .document('sensies/{id}')
  .onCreate((snap, context) => {

    const newSensateId = context.params.id;

    return new Promise((resolve, reject) =>{
        const sensate = snap.data();
        //console.log('sensateData',sensate);

        const sensateDesiredClusters = sensate.desiredClusters;
        const sensatesDoB = sensate.dateTimeOfBirth;
        const aboutme = sensate.aboutme;
        //let clustersRef = db.collection('clusters');
        //console.log("new", sensateDesiredClusters, sensatesDoB,aboutme)

        let dob = moment(sensatesDoB);
        console.log(dob,extractMonthAndDayFromDate(dob))
        db.collection('clusters')
            .where('type','==','monthAndDay')
            .where('typeData', '==',  extractMonthAndDayFromDate(dob))
            .get().then((clustersFiltered) => {

            console.log('then de clusters - 37', clustersFiltered.size, JSON.stringify(clustersFiltered.query));

            if(!clustersFiltered.empty){
                console.log('not empty');
                //add sensate to clusters
                clustersFiltered.forEach((cluster:any) => {
                    const clusterData = cluster.data();
                    console.log(clusterData);
                    const clusterType = clusterData.type;
                    
                    let sensates = clusterData.sensates;

                    updateCluster(cluster.id, clusterType, sensates, newSensateId).then((res)=>{
                        console.log(res);
                        resolve(res);
                    }).catch((err)=>{
                        reject(err);
                    });

                });
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

export const sensieClusterApproval = functions.firestore
.document('/clusters/{clusterId}/sensieapprovals/{approvalId}')
.onCreate((snap, context) =>{
    const clusterId = context.params.clusterId;

    return new Promise((resolve, reject) =>{
        const approvalData = snap.data();
        const newSensieId = approvalData.newSensieUid;
        const status = approvalData.status;
        let sensatesObj = {};

        return db.doc('clusters/'+clusterId).get().then((clusterInfo)=>{
            let clusterData = clusterInfo.data();
            let pendingApproval = [];
            let approved = [];
            sensatesObj = clusterData.sensates;
            Object.keys(clusterData.sensates).forEach((sensie)=>{
                if(!clusterData.sensates[sensie]){
                    pendingApproval.push(sensie);
                }else{
                    approved.push(sensie);
                }
            });

            if(status == 'deny'){
                resolve({status: 'deny'});
            }
            if(status == 'approve'){
                db.collection('clusters/'+clusterId+'/sensieapprovals')
                .where('newSensieUid','==',newSensieId)
                .get()
                .then((sensieApprovalInfo)=>{
                    let sensieApprovalDocs = [];
                    sensieApprovalInfo.docs.forEach((sensieApprovalDoc)=>{
                        sensieApprovalDocs.push(sensieApprovalDoc.data());
                    });
                    //If the number of approvals matches the approved sensies, verify if all have approved.
                    if(approved.length === sensieApprovalDocs.length){
                        let sensieApproved:boolean = false;
                        sensieApprovalDocs.forEach((approval)=>{
                            approved.forEach((approvedSensie)=>{
                                if(approval.status == 'approve' && 
                                    approval.uid == approvedSensie){
                                    sensieApproved = true;
                                }
                            });
                        });
                        if(sensieApproved){
                            console.log(sensieApproved);
                            sensatesObj[newSensieId] = true;
                            db.doc('clusters/'+clusterId).update({
                                sensates: sensatesObj
                            }).then((res)=>{
                                resolve({status: sensieApproved});
                            },(err)=>{
                                resolve(err);
                            }).catch((err)=>{
                                resolve(err);
                            });
                        }
                    }else{
                        resolve({status: 'pending'});
                    }
                },(err)=>{
                    reject(err);
                }).catch((err)=>{
                    reject(err);
                });
            }
        }).catch((err)=>{
            reject(err);
        });
    });
});

/*export const clusterCreation = functions.firestore
  .document('sensies/{id}')
  .onCreate((snap, context) => {

    const newSensateId = context.params.id;
    console.log(newSensateId);

    return new Promise((resolve, reject) =>{
        const sensate = snap.data();
        console.log('sensateData',sensate);

        const sensateDesiredClusters = sensate.desiredClusters;
        //const sensatesLanguages = sensate.languagesSpoken;
        const sensatesDoB = sensate.dateTimeOfBirth;
        const sensateDobOnly = sensate.dateOfBirth;
        const sensatesSkills = sensate.skills;
        const sensatesHobbies = sensate.hobbies;
        const sensatesInterests = sensate.interests;
        //const sensatesShowsCharacter = sensate.showsCharacter;

        //Fix this query aggregation issue
        //let clustersRef = db.collection('clusters');
        let clustersRef;

        //Aggregate the query
        if(sensateDesiredClusters['dateTimeOfBirth']){
            let dob = sensateDobOnly;
            
            console.log(dob);

            clustersRef = db.collection('clusters')
                .where('type','==','dateTimeOfBirth')
                .where('typeData', '==', dob);
        }
        if(sensateDesiredClusters['monthAndDay']){
            let dob = moment(sensatesDoB);
            //Fix this query aggregation issue
            //clustersRef
            //    .where('type','==','monthAndDay')
            //    .where('typeData', '==',  extractMonthAndDayFromDate(dob));
        }
        if(sensateDesiredClusters['monthAndYear']){
            let dob = moment(sensatesDoB);
            //Fix this query aggregation issue
            //clustersRef
            //    .where('type','==','monthAndYear')
            //    .where('typeData', '==',  extractMonthAndYearFromDate(dob));
        }
        if(sensateDesiredClusters['month']){
            let dob = moment(sensatesDoB);
            //Fix this query aggregation issue
            //clustersRef
              //  .where('type','==','month')
              //  .where('typeData', '==', extractMonthFromDate(dob));
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
                        console.log(res);
                        resolve(res);
                    }).catch((err)=>{
                        reject(err);
                    });

                });
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
*/

/*export const deletePostSubcollection = functions.firestore
.document('clusters/{clusterId}/posts/{postId}/{collection}')
.onDelete((snap, context) => {
    console.log(snap, JSON.stringify(snap));
    console.log(context, JSON.stringify(context));
    return deleteCollection(db,context.resource.name,5);
});*/

function getSensatesData(sensates, newSensateId){
    let sensatesPromises = [];
    Object.keys(sensates).forEach((sensateKey)=>{
        if(sensateKey !== newSensateId){
            sensatesPromises.push(
                db.collection('sensies').doc(sensateKey).get().then((sensateData)=>{
                    if(sensateData.exists){
                        return sensateData.data();
                    }else{
                        return null;
                    }
                }).catch((err)=>{
                    return null;
                })
            )
        }
    });

    return Promise.all(sensatesPromises)
    .then((resolvedValues) => {
        let list=[];
        
        resolvedValues.forEach((sensatesData)=>{
            if(sensatesData){
                list.push( {
                    email: sensatesData.email,
                    name: sensatesData.name
                });
            }
        });

        return list;
    });

}

function updateCluster(clusterId, clusterType, sensates, newSensateId){
    
    return new Promise((resolve, reject) =>{

        sensates[newSensateId] = false;

        db.collection('clusters').doc(clusterId).update({sensates: sensates}).then((sensateAddedResponse:any)=>{
            console.log('Added to '+clusterType+' cluster', sensateAddedResponse);

            setClaimToUser(newSensateId, clusterId, auth).then(()=>{
                console.log('setClaimToUser');

                getSensatesData(sensates, newSensateId).then((sensateList)=>{
                    sendEmail(sensateList).then((emailResponse)=>{
                        console.log('emailResponse',emailResponse);
                        resolve(emailResponse);
                    }).catch((err)=>{
                        console.log(err);
                        resolve('Sensate added but others not notified');
                    });
                    
                }).catch((errr)=>{
                    console.log(errr);
                    reject(errr);
                });

            }).catch((err)=>{
                console.log(err);
                reject(err);
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
                    console.log(sensateData.dateOfBirth);
                    clusterTypeData = sensateData.dateOfBirth;
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

                    setClaimToUser(newSensateId, responseAdd.id, auth).then(()=>{
                        console.log('userClaimResponse');
                        resolve('Cluster created');
                    }).catch((err)=>{
                        reject(err);
                    });
                    
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