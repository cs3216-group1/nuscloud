var passport = require('passport');

exports.dummyData = function(req, res, next){
    passport.authenticate('bearer', {session: false}, function(err, user, scope){
        if(err || !user){ return res.status(404).json({status: 'error'}); }
        else {
            return res.json({
                status: 'ok',
                friends: [{
                    id: 11,
                    name: 'Alice',
                    queryString: 'MNO1001[SEC]=A3&ACC1002[LEC]=V2&ACC1002[TUT]=V02&GEM1031[SEM]=1&BSP1004[SEC]=A1&DSC1007[SEC]=B1'
                }, {
                    id: 21,
                    name: 'Bob',
                    queryString: 'MA1521[LEC]=SL1&MA1521[TUT]=T02&MA1101R[LEC]=SL1&MA1101R[LAB]=B07&MA1101R[TUT]=T07&CS1231[SEC]=2&CS1231[TUT]=8&CS1101S[LEC]=1&CS1101S[TUT]=4&CS1101S[REC]=5&UWC2101B[SEM]=1'
                }, {
                    id: 32,
                    name: 'Charlie',
                    queryString: 'MNO2007[SEC]=G1&BSP2001[LEC]=X1&BSP2001[TUT]=X02&ACC2002[LEC]=B2&ACC2002[TUT]=B02&FIN2004[SEC]=J06&GEK1542[LEC]=SL1'
                }, {
                    id: 43,
                    name: 'Dave',
                    queryString: 'ST2334[LEC]=SL1&ST2334[TUT]=T4&CS2106[LEC]=1&CS2106[TUT]=4&CS2106[LAB]=1&CS2105[LEC]=1&CS2105[TUT]=4&CS2103[LEC]=1&CS2103[TUT]=2&CS2102[LEC]=1&CS2102[TUT]=7'
                }, {
                    id: 54,
                    name: 'Eric',
                    queryString: 'CS4212[LEC]=1&PH1102E[LEC]=1&PH1102E[TUT]=W1&CS2102[LEC]=1&CS2102[TUT]=7&CS3216[LEC]=1&CS3216[TUT]=2&CS4232[LEC]=1&CS4232[TUT]=1'
                }]
            });
        }
    })(req, res, next);   
}
