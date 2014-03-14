var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb').MongoClient;
var crypto = require('crypto');

passport.use(new LocalStrategy(
	function(name, pass, done){
		mongodb.connect('mongodb://localhost:27017/sorelcom', function(err, db){
			if(err)	return done(err);
		
			db.collection('users').find({'username':name}).nextObject(function(err, user){
				if(err)
					return done(err);
				if(!user)
					return done(null, false, {message:"User does not exist"});

				hash(pass, user.salt, function(err, hash){
					if(err)
						return done(err);
					if(hash == user.hash)
						return done(null, user.username);
					done(new Error("Invalid password"));
				});
				
			});
		});
	}
));

passport.serializeUser(function(user, done) {
    return done(null, user.id);
});

exports.login = function(req, res){
 	passport.authenticate('local', function(err ,user, params){
 		if(err)
 			return res.json({"success": false, "result":err.message});
 		if(!user)
 			return res.json({"success": false, "result":params.message});
 		
 		req.session.user = user;
 		//req.session.save();
 		res.json({"success":true, "result":user});
	})(req, res);
};

exports.logout = function(req, res){
  	delete req.session.user;
  	res.json({"success":true});	
}

exports.register = function(req, res){
	data = req.body;
	hash(data.password, function(err, salt, hash){
  		if (err) 
  			return res.json({"success":false, "result":err});
  		data.salt = salt;
  		data.hash = hash;

  		mongodb.connect('mongodb://localhost:27017/sorelcom', function(err, db){
			if(err)	
				return res.json({"success":false, "result":err});
		
			db.collection('users').insert(data, {safe:true}, function(err, objects){
				if(err)
			 		return res.json({"success":false, "result":err});
			 	req.session.user = data.username;
				return res.json({"success":true, "result":objects});
			});
		});
	});
};






/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

var len = 128;
var iterations = 1200;

var hash = function (pwd, salt, fn) {
  if (3 == arguments.length) {
    crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
      fn(err, hash.toString('base64'));
    });
  } else {
    fn = salt;
    crypto.randomBytes(len, function(err, salt){
      if (err) return fn(err);
      salt = salt.toString('base64');
      crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
        if (err) return fn(err);
        fn(null, salt, hash.toString('base64'));
      });
    });
  }
};