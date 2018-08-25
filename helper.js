
//exception yakalarken mesajların daha generic olmasını sağlıyor
var error = function(par1,par2){
    var sonuc  = par1.toString() + " " + par2.toString();
    return sonuc;
}
function reverseString(str){
    return str.split("").reverse().join("");
}

//reqest son string veri tipi yolladığı için çift tırnakları silmek gerekiyor 
var cleanWhiteCharacter = function(address){
     address = address.replace('"','');
     address = reverseString(address);
     address = address.replace('"','');
     address = reverseString(address);
     return address;
}


module.exports = {
    error,
    cleanWhiteCharacter
};
