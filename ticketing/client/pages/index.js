import buildClient from "../API/build-client";

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are not signed in</h1>
  );
};

//the React context?
LandingPage.getInitialProps = async (context) => {
  const { data } = await buildClient(context).get("/api/users/currentuser");
  return data;
};

//Adding a getInitialProps to the _app means this isn't auto invoked anymore on pages...
// We have to move it to custom app and invoke it from there

export default LandingPage;
