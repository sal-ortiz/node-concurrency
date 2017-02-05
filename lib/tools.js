module.exports = {

  argumentsToArray: function(argumentsObj){
    return argumentsObj.length === 1 ? [argumentsObj[0]] : Array.apply(null, argumentsObj);
  },

}
