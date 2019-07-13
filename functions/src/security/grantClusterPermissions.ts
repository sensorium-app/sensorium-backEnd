export function setClaimToUser(uid:string, clusterId:string, auth:any){
    var obj = {
      clusterIds: {}
    };

    obj.clusterIds[clusterId] = true;
    
    return new Promise((resolve, reject)=>{
      auth.setCustomUserClaims(uid, obj).then(() => {
        console.log('setClaimToUser finished: ' + uid + ' ' + clusterId);
        resolve();
      }).catch((err)=>{
        console.error(err);
        reject(err);
      });
    });
}