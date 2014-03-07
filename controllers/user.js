var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb').MongoClient;
var crypto = require('crypto');

passport.use(new LocalStrategy(
	function(name, pass, done){
		mongodb.connect('mongodb://localhost:27017/sorelcom', function(err, db){
			if(err)	return done(err);
		
			db.collection('users').find({'name':name}).nextObject(function(err, user){
				if(err)
					return done(err);
				if(!user)
					return done(null, false, {message:"User does not exist"});

				hash(password, user.salt, function(err, hash){
					if(err)
						return done(err);
					if(hash == user.hash)
						return done(null, user);
					done(new Error("Invalid password"));
				});
				
			});
		});
	}
));

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res){
	console.log(req.body);
 	passport.authenticate('local', function(err ,user, params){
 		if(err)
 			return res.json({"success": false, "result":err})
 		if(!user)
 			 return res.json({"success": false, "result":params.message})

 		res.json({"success":true, "name":"nameme"});
	})(req, res);
};

exports.register = function(req, res){
	console.log(req.body);
	res.json({"message":"MON WTF"});
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

exports.hash = function (pwd, salt, fn) {
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