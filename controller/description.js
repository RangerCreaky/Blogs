module.exports.description = (desc)=>{
    let dp = '';
    let dw = '';
    if(desc){
        if(desc.length <= 50){
            dp = desc;
        }
        else{
            dp = desc.substr(0 , 50);
            dw = desc.substr(51 , (desc.length - 50));
        }
    }

    return {phone : dp , web : dw };
}