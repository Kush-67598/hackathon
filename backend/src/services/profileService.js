const User = require("../models/User");
const ApiError = require("../utils/ApiError");

async function createOrUpdateProfile(payload) {
  const { userId, ...profileData } = payload;

  if (userId) {
    const updated = await User.findByIdAndUpdate(userId, profileData, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      throw new ApiError(404, "User not found");
    }
    return updated;
  }

  const created = await User.create(profileData);
  return created;
}

async function getProfileById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
}

module.exports = { createOrUpdateProfile, getProfileById };
