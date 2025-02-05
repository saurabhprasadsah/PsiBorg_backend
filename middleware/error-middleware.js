const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "An error occurred";
  const extraDetails = err.extraDetails||"Please connect to administrator and try again";
  // console.log(err.status, message, extraDetails);
  return res
    .status(status)
    .json({ success:false, message: message, extraDetails: extraDetails });
};

module.exports = errorMiddleware;