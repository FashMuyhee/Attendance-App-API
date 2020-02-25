"use strict";

const User = use("App/Models/User");
const { validate } = use("Validator");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  //  /*  *
  //    * Show a list of all users.
  //    * GET users
  //    *xx
  //    * @param {object} ctx
  //    * @param {Request} ctx.request
  //    * @param {Response} ctx.response
  //    * @param {View} ctx.view
  //    */
  //   async index ({ request, response, view }) {
  //   }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const data = request.only(["email", "password"]);
      const rules = {
        email: "required|email|unique:users,email",
        password: "required"
      };

      const validation = await validate(data, rules);
      if (validation.fails()) {
        return response
          .status(400)
          .send({ payload: { type: "error", error: validation.messages() } });
      }

      await User.create(data);
      return response.status(200).send({
        payload: { type: "success", message: "Regristration Sucessfull" }
      });
    } catch (error) {
      return response.status(error.status).send(error);
    }
  }

  async login({ auth, request, response }) {
    try {
      const { email, password } = request.all();
      const user = await auth.attempt(email, password);
      
      return response.status(200).send({ payload: { type: "success", user } });
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }

  /* async logout({ auth, response }) {
    // try {
    const user = await auth.authenticator("session").logout(auth.getUser());
    if (user) return response.json({ ee: "ww" });
    // return response.status(200).send({ message: "Logged Out" });
    // } catch (error) {
    //   return response.status(error.status).send(error);
    // }
  } */

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response }) {
    return response.send(params);
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  // /**
  //  * Delete a user with id.
  //  * DELETE users/:id
  //  *
  //  * @param {object} ctx
  //  * @param {Request} ctx.request
  //  * @param {Response} ctx.response
  //  */
  // async destroy ({ params, request, response }) {
  // }
}

module.exports = UserController;
