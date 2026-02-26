import { httpRouter } from "convex/server";
import { handleClerkWebhook, saveSignupData } from "./clerk";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: handleClerkWebhook,
});

http.route({
  path: "/signup-data",
  method: "POST",
  handler: saveSignupData,
});

export default http;
