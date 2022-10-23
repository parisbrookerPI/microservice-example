# Note about async and error handling in express

- Async call returns a promise, not a value, i.e. not an error value that Express will catch automatically
- Actually need the next functionality... OR...
- Use express-async-errors
  - install and import right after express

# Mongoose and TypeScript

## Issue one

- TypeScript wants to understand the argument types being passed to mongoose, but mongoose doesn't pass this back to TS by default
  Solution: Teach TS what properties will be passed to the mongoose constructor

## Issue two

- Mongoose adds properties to documents, and TS won't be expeting this
  Solution: Teach TS that there ar two sets of properties: those passed in, and those provided by mongoose

# Generics in TS

```
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}
```

```
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
```

Calling model above requires arguments.
Think of generics as Type arguments being passed to the Model function (which correspond to the type of arguments being passed??).

# Mongoose pre hooks (like mongoose middleware)

```
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

```

# JWT vs. Cookies

## Cookies

- Res can include "set-header: cookie"
- following req will have header: {cookie: {cookie}}
- managed by the browser
- can move any kind of data between client and server

## JWT

- takes arbitary info and converts to payload
- converts to JWT with algo
- contains the payload
- Can convey the JWT to and from browser in, e.g auth-header
- manually managed

JWT inside a cookie is a good solution

- Libray: cookie-session

# ENV variables in K8s

`k create secret generic jwt-secret --from-literal=jwt=asdf`

An Imperative command approach

see auth-depl.yaml for how to feed ENV into pod
