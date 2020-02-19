function mostrar(){
    document.getElementById("salida").innerHTML = '';
    var limite= document.getElementById("numero").value;
    console.log(limite);
    if(limite<=0){}
    else if(limite==1){
        document.getElementById("salida").innerHTML += "1";
    }
    else if(limite>=2) {
        document.getElementById("salida").innerHTML += "1, 2";
        for(let n=3;n<=limite;n++){
            var torn=true;
            if(n%2==1){
                for(let p=3;p<(n/2-1);p++){
                    if(n%p==0){
                        torn=false;
                    }
                }
                if(torn==true){
                    document.getElementById("salida").innerHTML += ", " + n;
                }
            }
        }
    }
    return false;
}