const asyncHandler = require("../utils/asyncHandler");
const { createOrUpdateProfile } = require("../services/profileService");

const upsertProfile = asyncHandler(async (req, res) => {
  const user = await createOrUpdateProfile(req.body);
  res.status(200).json({ message: "Profile saved", data: user });
});

module.exports = { upsertProfile };
