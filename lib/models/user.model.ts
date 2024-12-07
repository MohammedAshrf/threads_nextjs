import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    bio: { type: String },
    threads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }],
    onboarding: {
      type: Boolean,
      default: false,
    },
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
  },
  { strict: true } // Ensures only these fields are saved
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
