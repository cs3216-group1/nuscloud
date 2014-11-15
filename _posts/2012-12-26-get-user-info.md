---
category: user
path: '/:userId/userinfo'
title: 'Get user info'
type: 'GET'

layout: nil
---

This method returns users basic info.

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

A special case of this request substitutes **me** for **:userId** to get info of the logged in user

Requires **info-read** permission

### Response

Sends back an object containing info of the user.

```{
    status: 'ok',
    info: {
        userId: 'abcdefgh12',
        username: 'johndoe',
        name: 'John Doe',
        email: 'johndoe@nus.edu.sg'
    }
}```

For errors responses, see the [status documentation](#/error-codes).
