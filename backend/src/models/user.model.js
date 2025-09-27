import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    // ------------------ Basic Info ------------------
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ------------------ Profile Fields ------------------
    profileImage: { type: String, default: "" },
    bio: { type: String, maxLength: 150, trim: true, default: "" },
    description: { type: String, maxLength: 500, trim: true, default: "" },
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      x: { type: String, default: "" }, // X / Twitter
      website: { type: String, default: "" },
    },

    // ------------------ Gamification Fields ------------------
    points: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: { type: [String], default: [] },

    // ------------------ Practice Details ------------------
    questionsSolved: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },

    // ------------------ Badge Counters / Achievements ------------------
    fastSolverCount: { type: Number, default: 0 },
    contestRankTop10: { type: Boolean, default: false },
    judgeHeroStreak: { type: Number, default: 0 },
    mentorActivities: { type: Number, default: 0 },
    collaborationActivities: { type: Number, default: 0 },
    sharedSolutionsCount: { type: Number, default: 0 },

    // ------------------ Streak / Login Info ------------------
    lastLogin: { type: Date },
    consecutiveLoginDays: { type: Number, default: 0 },

    // ------------------ Account Info ------------------
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
  },
  { timestamps: true }
);

// ------------------ Pre-save Middleware ------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

// ------------------ Methods ------------------

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
};

// Calculate level based on XP
userSchema.methods.calculateLevel = function () {
  try {
    this.level = Math.floor(this.xp / 100) + 1;
    return this.level;
  } catch (error) {
    console.error("Error calculating level:", error);
    return this.level || 1;
  }
};

// ------------------ Badge Management ------------------
userSchema.methods.updateBadges = function () {
  try {
    const badges = this.badges || [];

    // 1. Onboarding / Profile
    if (this.isNew && !badges.includes("New User")) badges.push("New User");
    const profileComplete =
      this.profileImage &&
      this.bio &&
      this.description &&
      this.socialLinks &&
      (this.socialLinks.github ||
        this.socialLinks.linkedin ||
        this.socialLinks.x ||
        this.socialLinks.website);
    if (profileComplete && !badges.includes("Profile Complete"))
      badges.push("Profile Complete");

    // 2. Problem-Solving Milestones
    const totalSolved =
      (this.questionsSolved.easy || 0) +
      (this.questionsSolved.medium || 0) +
      (this.questionsSolved.hard || 0);

    if (totalSolved >= 10 && !badges.includes("Rising Star"))
      badges.push("Rising Star");
    if (totalSolved >= 50 && !badges.includes("Problem Solver"))
      badges.push("Problem Solver");
    if (totalSolved >= 100 && !badges.includes("Code Master"))
      badges.push("Code Master");
    if (
      this.questionsSolved.easy >= 50 &&
      this.questionsSolved.medium >= 50 &&
      this.questionsSolved.hard >= 50 &&
      !badges.includes("All-Rounder")
    )
      badges.push("All-Rounder");

    // 3. Difficulty-Based Badges
    if (this.questionsSolved.easy >= 50 && !badges.includes("Easy Peasy"))
      badges.push("Easy Peasy");
    if (this.questionsSolved.medium >= 50 && !badges.includes("Medium Warrior"))
      badges.push("Medium Warrior");
    if (this.questionsSolved.hard >= 50 && !badges.includes("Hardcore Coder"))
      badges.push("Hardcore Coder");

    // 4. Streak & Consistency
    if (this.consecutiveLoginDays >= 7 && !badges.includes("Daily Coder"))
      badges.push("Daily Coder");
    if (this.consecutiveLoginDays >= 7 && !badges.includes("Weekly Streak"))
      badges.push("Weekly Streak");
    if (this.consecutiveLoginDays >= 30 && !badges.includes("Monthly Marathon"))
      badges.push("Monthly Marathon");

    // 5. XP Milestones
    if (this.xp >= 100 && !badges.includes("XP Novice"))
      badges.push("XP Novice");
    if (this.xp >= 500 && !badges.includes("XP Expert"))
      badges.push("XP Expert");
    if (this.xp >= 1000 && !badges.includes("XP Legend"))
      badges.push("XP Legend");

    // 6. Contest / Challenge Badges
    if (this.fastSolverCount >= 1 && !badges.includes("Fast Solver"))
      badges.push("Fast Solver");
    if (this.contestRankTop10 && !badges.includes("Contest Champion"))
      badges.push("Contest Champion");
    if (this.judgeHeroStreak >= 10 && !badges.includes("Judge Hero"))
      badges.push("Judge Hero");

    // 7. Social / Contribution Badges
    if (this.mentorActivities >= 1 && !badges.includes("Mentor"))
      badges.push("Mentor");
    if (this.collaborationActivities >= 1 && !badges.includes("Collaborator"))
      badges.push("Collaborator");
    if (this.sharedSolutionsCount >= 1 && !badges.includes("Sharer"))
      badges.push("Sharer");

    this.badges = badges;
  } catch (error) {
    console.error("Error updating badges:", error);
  }
};

// ------------------ Streak Management ------------------
userSchema.methods.trackLoginStreak = function () {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastLoginDate = this.lastLogin ? new Date(this.lastLogin) : null;
    if (lastLoginDate) lastLoginDate.setHours(0, 0, 0, 0);

    if (lastLoginDate) {
      const diffDays = Math.round(
        (today - lastLoginDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1)
        this.consecutiveLoginDays = (this.consecutiveLoginDays || 0) + 1;
      else if (diffDays > 1) this.consecutiveLoginDays = 1;
    } else {
      this.consecutiveLoginDays = 1;
    }

    this.lastLogin = new Date();
    if (this.updateBadges) this.updateBadges();
  } catch (error) {
    console.error("Error tracking login streak:", error);
  }
};

// ------------------ Achievement Helper Methods ------------------

// Increment fast solver count
userSchema.methods.incrementFastSolver = function () {
  try {
    this.fastSolverCount += 1;
    this.updateBadges();
  } catch (error) {
    console.error("Error incrementing fast solver count:", error);
  }
};

// Set contest top 10 rank
userSchema.methods.setContestTop10 = function () {
  try {
    this.contestRankTop10 = true;
    this.updateBadges();
  } catch (error) {
    console.error("Error setting contest top10:", error);
  }
};

// Update judge hero streak
userSchema.methods.updateJudgeHeroStreak = function (success) {
  try {
    if (success) this.judgeHeroStreak = (this.judgeHeroStreak || 0) + 1;
    else this.judgeHeroStreak = 0;
    this.updateBadges();
  } catch (error) {
    console.error("Error updating judge hero streak:", error);
  }
};

// Increment mentor activities
userSchema.methods.addMentorActivity = function () {
  try {
    this.mentorActivities += 1;
    this.updateBadges();
  } catch (error) {
    console.error("Error adding mentor activity:", error);
  }
};

// Increment collaboration activities
userSchema.methods.addCollaborationActivity = function () {
  try {
    this.collaborationActivities += 1;
    this.updateBadges();
  } catch (error) {
    console.error("Error adding collaboration activity:", error);
  }
};

// Increment shared solutions count
userSchema.methods.addSharedSolution = function () {
  try {
    this.sharedSolutionsCount += 1;
    this.updateBadges();
  } catch (error) {
    console.error("Error adding shared solution:", error);
  }
};

// ------------------ OTP / Reset Password ------------------
userSchema.methods.generateResetToken = function () {
  try {
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
    this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    return otp;
  } catch (error) {
    console.error("Error generating reset token:", error);
    return null;
  }
};

const User = mongoose.model("user", userSchema);
export default User;
