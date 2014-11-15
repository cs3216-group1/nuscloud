---
title: 'Authenticate - Javascript'

layout: nil
---

###Login

Login through the SDK is straightforward. If initialized as earlier:

```nuscloud.login(callback)```

will initiliaze login. If the user is already logged in to NUSCloud and has provided all permissions to your app, there will not be any prompt. Else, he will be prompted to login via a NUSCloud popup and to provide any needed permissions.

###Logout

Logout is also straightforward

```nuscloud.logout(callback)```

will logout the user from the app by deactivating any access tokens provided.

###Status

```nuscloud.getLoginStatus(callback)```

will provide the users status as a response to the callback. The possible results are:

- **{status: unknown}** - if the user is not logged into NUSCloud
- **{status: unauthorized}** - if the user is logged in and has not authorized the app
- **{status: connected}** - user is logged in and app has a valid token
