---
category: app
path: '/:appId/userinfo'
title: 'Get app info'
type: 'GET'

layout: nil
---

This method returns the basic info of the app which is logged in.

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

A special case of this request substitutes **app** for **:appId** to get info of the logged in user

### Response

Sends back an object containing info of the user.

```{
    status: 'ok',
    info: {
        name: 'Cool App',
        namespace: 'coolapp'
    }
}```

For errors responses, see the [status documentation](#/error-codes).
