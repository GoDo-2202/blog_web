export const errorHandler = (err, req, res, next) => {
  console.error(err); // log server side

  if (err.isOperational) {
    const status = err.statusCode || 400;
    return res.status(status).json({
      success: false,
      code: err.code || "ERROR",
      statusCode: status,
      message: err.message,
      errors: err.errors || null,
    });
  }

  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    statusCode: 500,
    message: "Something went wrong",
    errors: null,
  });
};

