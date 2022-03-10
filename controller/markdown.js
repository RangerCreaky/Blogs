const heading = (heading)=>{
    let num = 0;
    // ###heading

    while(heading[num] === '#'){
        num++;
    }
    return num;
}

const updateBold = (para)=>{
    let reg = /\*\*[^*]*\*\*/;
    while(true){
        let str = reg.exec(para);
        if(!str){
            break;
        }
        let innerString = str[0].slice(2 , str[0].length-2);
        let to_replace = `<strong> ${innerString} </strong>`;
        para = para.replace(reg , to_replace);
    }
    return para;
}

const updateItalics = (para)=>{
    let reg = /\*[^*]*\*/;
    while(true){
        let str = reg.exec(para);
        if(!str){
            break;
        }
        let innerString = str[0].slice(1 , str[0].length-1);
        let to_replace = `<em> ${innerString} </em>`;
        para = para.replace(reg , to_replace);
    }
    return para;
}

const updateLinks = (para) =>{
    let reg = /\[[^*]*]<[^*]*>/;
    while(true){
        let str = reg.exec(para);
        if(!str) break;

        
        let opensq = str[0].indexOf('[');
        let closesq = str[0].indexOf(']');
        let openp = str[0].indexOf('<');
        let closep = str[0].indexOf('>');
        // 0 1 2 3 4 5 6 7 8 9 10 11
        // [ l i n k ] < l i n k   >

        let linkName = str[0].slice(opensq+1 , closesq);
        let linkAdd = str[0].slice(openp+1 , closep);

        let to_replace = `<a href="${linkAdd}" target="_blank">${linkName}</a>`
        para = para.replace(reg , to_replace);
    }
    return para;
}
module.exports.markdown =  (html , images)=>{
    let arr = html.split('\r\n');
    let paragraph;
    arr.forEach((element , index) => {
        if(element.startsWith('#')){
            // heading
            let hcount = heading(element);
            arr[index] = `<h${hcount} class="sub-title"> ${element.slice(hcount , element.length)} </h${hcount}>`;    
        }
        else if(element.startsWith('!')){
            // image
            // it will be of the form ![1]<link>
            // or ![name] for image uploaded from multer

            if(element.split(']')[1].length === 0){
                // Then it is uploaded from multer
                let ind = element[2];
                arr[index] = `<div class="image"><img src="../uploads/photos/${images[ind-1].filename}" alt=""> </div>`;
            }
            else{
                let start = element.indexOf("<");
                let end = element.indexOf(">");
                let link = element.slice(start+1 , end);
                arr[index] = `<div class="image"><img src="${link}" alt=""> </div>`;
            }
        }
        else{
            // Then it is a simple paragraph
            // This has links starting with [name]<link>
            // bolds start with ** and ends with **
            // italics start with __ and ends with __
            paragraph = updateBold(element);
            paragraph = updateItalics(element);
            paragraph = updateLinks(element);

            arr[index] = `<div class="para">${paragraph}</div>`
        } 
    });
    let markdown = arr.join(' ');

    return markdown;
}

