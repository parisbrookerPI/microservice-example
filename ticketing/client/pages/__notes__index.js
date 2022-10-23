import axios from "axios"; //Can't use the use-request hook because hooks can only be used inside a component. getInitialProps is a plain fucntion, so need to use axios

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  return <h1>landingpage</h1>;
};

//The below is all very ugly and repeatable, so let's build a helper function to do it

// next makes req object available like express
LandingPage.getInitialProps = async ({ req }) => {
  if (typeof window === "undefined") {
    //means we're on the server, so reqs go to nginx
    const { data } = await axios.get(
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
      {
        headers: req.headers, // to pass all the headers on, including domain and cookie to nginx
        // {
        //   // Host: "ticketing.dev", // got to set the domain header so nginx knows where to route
        // },
      }
    );
    return data;
  } else {
    // means we're on browser, so no need to define base domain
    const { data } = await axios.get("/api/users/currentuser");
    return data;
  }
  return {};
}; //A next.js thing to get data during SSR. Data is the provided to create initial state of components. So data in here is handed to component on first page load.
// After that, it's up to the components to deal with the data

export default LandingPage;

//By default, get initial props fails (a request from server) with EconnRefused, but a request from component works
// So, why does server reject a request from itself and not the browser? (It's a K8s issue) - See 235 for this
// BAsically, server request doesn't know the domain, so node sticks on a domain, that is the loopback. but in a container, that isn't the redirect specified in hosts
// The 127.0.0.1:80 error isn't the loopback on the machine; it's the loopback on the container.
// Solutions?
// 1) Configue axios depending on where req is made from
// 2a) Configure Next.js to route to container name/Cluster IP ? - No good; means you have to encode exact services names in React
// 2b) Get next to make the request to nginx... better sice routing is done already. But remember cookies!! node JS doesn't care about cookies like the browser does

//See 237 for K8S namespace stuff - Cross-Namespace communitcation is required
// http://NAMEOFSERVICE.NAMESPACE.svc.cluster.local
// http://ingress-nginx-controller.ingress-nginx.svc.cluster.local

// Create an external name service for easy mapping (not included - DYOR)

// How to distinguish between requests made by the browser vs. a component ?
// When coming from a component, request is issued by the browser, so np
// getInitialProps req might be from server or browser (under particular circumstances*)... so have to find env to make axios behave as desired
// *
// Hard refresh -> getInitialProps executed on server
// Click link from different domain-> getInitialProps executed on server
// URL in address bar -> getInitialProps executed on server
// BUT
// Navigating from one page to another in app -> getInitialProps executed on THE CLIENT
