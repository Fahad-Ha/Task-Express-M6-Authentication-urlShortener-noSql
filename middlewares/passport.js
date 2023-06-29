const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const { fromAuthHeaderAsBearerToken } = require("passport-jwt").ExtractJwt;
const User = require("../db/models/User");
const bcrypt = require("bcrypt");
const { SECRET_KEY } = require("../config/keys");

exports.localStrategy = new LocalStrategy(
  { usernameField: "username" },
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });

      const passwordsMatch = user
        ? await bcrypt.compare(password, user.password)
        : false;
      if (passwordsMatch) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error);
    }
  }
);

exports.jwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY,
  },
  async (jwtPayLoad, done) => {
    if (Date.now() > jwtPayLoad.exp * 1000) {
      return done(null, false);
    }
    try {
      const user = await User.findById(jwtPayLoad._id);

      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);
