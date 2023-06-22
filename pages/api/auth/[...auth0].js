import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

//setup all api end points for authentication

//every key passed to the handleAuth() func will generate the new api endpoint
export default handleAuth({
  signup: handleLogin({ authorizationParams: { screen_hint: "signup" } }),
});
