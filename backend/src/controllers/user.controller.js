import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// tested
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("All fields are required");
    }

    const user = await User.findOne({
      email,
    });
    console.log("Us ", user);

    if (!user) {
      throw new Error("No such user exists");
    }

    const isPasswordCorrect = password === user.password;
    if (!isPasswordCorrect) {
      throw new Error("Incorrect credentials");
    }

    return res.status(201).json({
      success: true,
      message: "User signed In successfully",
      data: user,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message, data: {} });
  }
};

// tested
const signUp = async (req, res) => {
  try {
    const { username, email, password, latitude , longitude } = req.body;
    console.log("Us ", req.body);

    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new Error("User already exists");
    }

    let user = await User.create({
      username,
      email,
      password,
      media: {
        public_id: "",
        secure_url: "",
      },
      friends: [],
      location: {
        latitude , 
        longitude
      },
      badges: [] , 
    });

    if (!user) {
      throw new Error("User registration failed . Please try again");
    }

    const avatarLocalPath = req?.file?.path;
    console.log("avatarLocalPath ", avatarLocalPath);

    if (req.file) {
      try {
        const media = await uploadOnCloudinary(avatarLocalPath);
        if (media) {
          user.media.public_id = media.public_id;
          user.media.secure_url = media.secure_url;
        }
      } catch (error) {
        console.log("Avatar upload ERROR !!", error);
        throw new Error("Unable to upload media");
      }
    }

    await user.save();

    user = await User.findById(user._id);
    return res
      .status(200)
      .json({ success: true, message: "User created Succesfully", data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export { signUp, signIn };
