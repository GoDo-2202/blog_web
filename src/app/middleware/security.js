import rateLimit from "express-rate-limit";

// ============================
// 1) RATE LIMIT TOÀN API
// ============================
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 200, // mỗi IP chỉ được 200 request/phút
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

// ============================
// 2) RATE LIMIT LOGIN (Anti brute-force)
// ============================
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5, // mỗi IP tối đa 5 lần đăng nhập
  message: {
    success: false,
    message: "Too many login attempts. Please wait 1 minute."
  }
});

// ============================
// 3) COOL DOWN (delay) theo user hoặc IP
// ============================
const userCooldown = {}; // map userId -> timestamp

export const cooldown = (seconds = 2) => {
  return (req, res, next) => {
    const userId = req.user?._id || req.ip;

    if (userCooldown[userId] && userCooldown[userId] > Date.now()) {
      const remaining = Math.ceil((userCooldown[userId] - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remaining}s before retrying.`
      });
    }

    // Set cooldown mới
    userCooldown[userId] = Date.now() + seconds * 1000;
    next();
  };
};

export const checkOwner = (req, res, next) => {
  const loggedInUserId = req.user.id;
  const targetUserId = req.params.id;

  if (loggedInUserId !== targetUserId) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to upload for another user."
    });
  }

  next();
};