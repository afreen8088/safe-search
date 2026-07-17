export function handleApiError(error) {
  const response = error?.response;
  const payload = response?.data;

  if (payload?.error) {
    return {
      code: payload.error.code || `HTTP_${response?.status || 500}`,
      message: payload.error.message || error.message || "Request failed",
      details: payload.error.details || null,
      status: response?.status || null,
    };
  }

  if (typeof payload === "string" && payload.trim()) {
    return {
      code: `HTTP_${response?.status || 500}`,
      message: payload,
      details: null,
      status: response?.status || null,
    };
  }

  if (payload?.message) {
    return {
      code: payload.code || `HTTP_${response?.status || 500}`,
      message: payload.message,
      details: payload.details || null,
      status: response?.status || null,
    };
  }

  if (error?.message) {
    return {
      code: response?.status ? `HTTP_${response.status}` : "REQUEST_FAILED",
      message: error.message,
      details: null,
      status: response?.status || null,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Something went wrong",
    details: null,
    status: null,
  };
}
