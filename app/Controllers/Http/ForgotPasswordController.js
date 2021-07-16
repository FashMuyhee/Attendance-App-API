"use strict";

const Hash = use("Hash");
const Mail = require("nodemailer");
const randomString = require("randomstring");
const Student = use("App/Models/Student");
const Lecturer = use("App/Models/Lecturer");
const PasswordReset = use("App/Models/PasswordReset");
const Env = use("Env");
const { validate } = use("Validator");

class ForgotPasswordController {
  // MAIL CONFIGURATION
  _mailConfig = Mail.createTransport({
    service: "gmail",
    auth: {
      user: Env.get("GMAIL_USERNAME"),
      pass: Env.get("GMAIL_PASSWORD"),
    },
  });

  /** send reset password token to user email
   * @param  {} {request
   * @param  {} response}
   *  route: /password-reset
   */
  async sendResetTokenEmail({ request, response }) {
    const { email, role } = request.all();

    const rules = {
      email: "required",
      role: "required",
    };

    const validation = await validate({ email, role }, rules);
    if (validation.fails()) {
      return response
        .status(400)
        .send({ payload: { type: "error", message: validation.messages() } });
    }
    let user;
    user = await Student.findBy("email", email);
   /*  if (role === "student") {
      user = await Student.findBy("email", email);
    } else if (role === "lecturer") {
      user = await Lecturer.findBy("email", email);
    } */
    try {
      if (user) {
        if (this._sendResetToken(email)) {
          return response.status(200).send({
            payload: {
              type: "success",
              message: "A reset token has been sent to your email",
            },
          });
        } else {
          return response.status(400).send({
            payload: {
              type: "error",
              message: "Something went wrong",
            },
          });
        }
      }
      return response.status(404).send({
        payload: { type: "error", message: "User with this email not Found" },
      });
    } catch (error) {
      return response.status(404).send({
        payload: { type: "error", message: "User with this Email Not Found" },
      });
    }
  }

  /**function that performs email token sending
   * @param  {} email
   */
  async _sendResetToken(email) {
    const reset_token = await this.storeResetToken(email);

    const mailOptions = {
      from: "support@attendance.io",
      to: email,
      subject: "Password Reset Token",
      text: `This is your token sent for password reset ${reset_token}`,
    };
    if (reset_token.length) {
      const emailStatus = this._mailConfig.sendMail(
        mailOptions,
        function (error, info) {
          if (error) return false;
          return true;
        }
      );

      return emailStatus;
    }
  }

  /**modular function that save requested token to password reset database
   * @param  {} email
   */
  async storeResetToken(email) {
    const random_str = randomString.generate({
      length: 6,
      charset: "numeric",
    });
    const token = await Hash.make(random_str);
    try {
      const reset_token = await PasswordReset.findOrCreate({ email });

      reset_token.merge({ token });
      await reset_token.save();

      return random_str;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * function to reset password with email and new password
   * @param  {} {request
   * @param  {} response}
   */
  async reset({ request, response }) {
    const { email, password } = request.all();

    const rules = {
      email: "required",
      password: "required",
    };

    const validation = await validate({ email, password }, rules);
    if (validation.fails()) {
      return response
        .status(400)
        .send({ payload: { type: "error", message: validation.messages() } });
    }
    try {
      await this._resetPassword(email, password);

      return response.status(200).send({
        payload: {
          type: "success",
          message: "Password Reset Successfully",
        },
      });
    } catch (error) {
      return response.status(400).send({
        payload: {
          type: "error",
          message: error,
        },
      });
    }
  }

  /**
   * to validate token for reset password
   * @param  {object} {request
   * @param  {} response}
   */
  async verifyToken({ request, response }) {
    const { token, email } = request.all();
    const rules = {
      email: "required",
      token: "required",
    };

    const validation = await validate({ email, token }, rules);
    if (validation.fails()) {
      return response
        .status(400)
        .send({ payload: { type: "error", message: validation.messages() } });
    }
    try {
      const reset_entry = await PasswordReset.findBy("email", email);
      const validated_token = await Hash.verify(token, reset_entry.token);
      if (validated_token && this._isTokenExpired(reset_entry)) {
        return response.status(200).send({
          payload: {
            type: "success",
            message: `Validated`,
          },
        });
      }
      return response.status(200).send({
        payload: {
          type: "error",
          error: `Token not Valid or Expired`,
        },
      });
    } catch (error) {
      return response.status(400).send({ payload: { type: "error", error } });
    }
  }

  /** check if token has expired
   * @param  {} reset_entry
   */
  _isTokenExpired(reset_entry) {
    const MINUTE = 1000 * 60;

    const expires_in_milliseconds = MINUTE * 120;
    const token_valid_since = Date.now() - expires_in_milliseconds;

    return reset_entry.updated_at <= token_valid_since;
  }

  /**
   * modular function that perform the password update
   * @param  {} email
   * @param  {} password
   * @param  {} role
   */
  async _resetPassword(email, password, role) {
    let user;
    if (role === "student") {
      user = await Student.findBy("email", email);
      user.password = await Hash.make(password);
    }
    user = await Lecturer.findBy("email", email);
    user.password = await Hash.make(password);

    try {
      const reset_entry = await PasswordReset.findBy("email", email);
      // token after reset
      await reset_entry.delete();
      return await user.save();
    } catch (error) {
      return response.status(404).send({
        payload: { type: "error", error: "User  with this email not found" },
      });
    }
  }
}

module.exports = ForgotPasswordController;
