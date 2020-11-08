

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const { URL_CODE_LENGTH } = process.env;
const urlCodeLength = parseInt(URL_CODE_LENGTH);

class UrlCodeGenerator {


    static getRandomURLCode(){
        let result =''
        var charactersLength = CHARACTERS.length;
        for ( var i = 0; i < urlCodeLength; i++ ) {
           result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result; 
    }

}

module.exports.UrlCodeGenerator = UrlCodeGenerator;
