import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    //means we're on the server, so reqs go to nginx
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // means we're on browser, so no need to define base domain
    return axios.create({
      baseURL: "/",
    });
  }
};
