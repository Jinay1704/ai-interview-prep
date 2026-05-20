export class ApiResponse {
  static success(data, message = "Success") {
    return { success: true, message, data };
  }

  static error(message = "Something went wrong", data = null) {
    return { success: false, message, data };
  }
}
