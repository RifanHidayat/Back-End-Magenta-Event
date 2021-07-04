'use strict';

exports.ok=function(data,res){
    var data={
        'code':200,
        'data':data,

    }
    res.json(data);
    res.end();
}

//exports.s

