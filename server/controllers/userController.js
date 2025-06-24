import bcrypt from 'bcryptjs';
import User from "../models/User.js";
import { generateToken } from '../lib/utils.js';
import cloudinary from "../lib/cloudinary.js";

// Signup User
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.json({
      success: true,
      user: newUser,
      token,
      message: "Account Created Successfully"
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user,
      token,
      message: "Login Successful"
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Check Auth
export const checkAuth = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, bio } = req.body;

    const userId = req.user._id;

    // Log to verify incoming data
    console.log("🔍 Incoming profilePic:", profilePic?.slice(0, 50)); // logs first 50 chars
    console.log("👤 fullName:", fullName, "📝 bio:", bio);

    let imageUrl = null;

    // Upload image to Cloudinary if profilePic is base64
    if (profilePic && profilePic.startsWith("data:image")) {
      const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "user_profiles",
      });
      imageUrl = uploadedResponse.secure_url;
    }

    // Build update object
    const updateFields = {
      fullName,
      bio,
    };
    if (imageUrl) {
      updateFields.profilePic = imageUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });
    res.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("❌ Error in updateProfile:", error.message);
    res.json({ success: false, message: error.message });
  }
};


