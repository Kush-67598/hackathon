const jwt = require("jsonwebtoken");
const Account = require("../models/Account");
const User = require("../models/User");

const getSecret = () => {
  try {
    const env = require("../config/env");
    return env.jwtSecret;
  } catch {
    return process.env.JWT_SECRET || "cyclesense-dev-secret-2024";
  }
};

const signToken = (account) => {
  return jwt.sign(
    { accountId: account._id, email: account.email },
    getSecret(),
    { expiresIn: "7d" }
  );
};

exports.register = async ({ name, email, password }) => {
  const existing = await Account.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error("An account with this email already exists.");
    err.statusCode = 409;
    throw err;
  }

  const account = await Account.create({ name, email, passwordHash: password });

  const user = await User.create({
    age: 26,
    cycleRegularity: "regular",
    flow: "moderate",
    averageCycleLength: 28,
    lifestyle: { sleepHours: 7, stressLevel: 3, exerciseFrequency: "moderate" },
    dietType: "omnivore",
    weightChange: "stable",
  });

  account.userId = user._id;
  await account.save();

  const token = signToken(account);
  return {
    token,
    user: {
      _id: account._id,
      name: account.name,
      email: account.email,
      userId: user._id,
    },
  };
};

exports.login = async ({ email, password }) => {
  const account = await Account.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!account) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await account.comparePassword(password);
  if (!isMatch) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(account);
  return {
    token,
    user: {
      _id: account._id,
      name: account.name,
      email: account.email,
      userId: account.userId,
    },
  };
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
};
