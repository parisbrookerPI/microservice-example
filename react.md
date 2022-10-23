# React Notes

## Server-side rendering

### Standard App:

Prob 3 requests to display data to user

| Browser | Traffic                    | Client                  |
| ------- | -------------------------- | ----------------------- |
|         | Request: GET ticketing.dev | React App               |
|         | Response: HTML             |                         |
|         |                            |                         |
|         | Request: need JS           | React App               |
|         | Response: JS               |                         |
|         |                            |                         |
|         | Request: Data              | Order Service (Express) |
|         | Response: Data             |                         |

### SSR App:

Reasons for using SSR

- Faster rendering (particularly on mobile )
- SSO

| Browser | Traffic                                 | Client      | Services                    |
| ------- | --------------------------------------- | ----------- | --------------------------- |
|         | Request: GET ticketing.dev              | Next JS >>> |                             |
|         |                                         |             | Order Service (Express)     |
|         |                                         |             |                             |
|         |                                         |             | Ticketing Service (Express) |
|         |                                         |             |                             |
|         | Response: Fully rendered HTML with data | <<< Next.JS |                             |
|         |                                         |             |                             |
|         |                                         |             |                             |

# Next.js

- requires routing files, but actually page file names correspond to route names

```json
 "scripts": {
    "dev": "next"
  }
```

to ensure file updates get picked up:

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
```

## wiring up bootstrap

- Global CSS has to be read from the Next.js wrapper
- create \_app.js in pages folder
- npm i bootstrap

```javascript
import "bootstrap/dist/css/bootstrap";
```

## When to make request to the auth service in first visit?

- Basically have to make the request while the app is being built

#### Next.js

Inspect URL of req. Decide whihc components ---> Call components' getInitialProps static method ---> Render with data from getInitialProps once --> Render and return
