module.exports = {
    formatConstantName: function(string){
        return string.trim().replace(/ /g,'_').replace('-','_').toLocaleUpperCase();
    },

    formatSentenceCaseUnderscore: function(string){
        string = string.toLowerCase();
        string = string.replace(/ /g,'_');
        string = string.replace('-','_');
        string = string.split('_');
        for (var i = 0; i < string.length; i++) {
            string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1); 
        }
        string = string.join('_'); 
        return string;
    }

};