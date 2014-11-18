---
title: 'Authenticate - Javascript'

layout: nil
---

###Login

Login through the SDK is straightforward. If the nuscloud object is initialized as earlier:

```nuscloud.login(callback)```

will initiliaze login. 

If the user is already logged in to NUSCloud and has provided all requested permissions to your app, there will not be any prompt. Else, he will be prompted to login via a NUSCloud popup and further prompted to provide any requested permissions.

No arguments are passed to the callback from login, so it is recommended that [getLoginStatus](/#status) be chained after login to confirm success.

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


