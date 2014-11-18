---
category: user
path: '/:userId/friends'
title: 'Get user friends'
type: 'GET'

layout: nil
---

This method returns users friends using the app.

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

A special case of this request substitutes **me** for **:userId** to get info of the logged in user

Requires **friends-read** permission

### Response

Sends back an object containing list of friends of the user.

```{
    status: 'ok'
    friends: [
        { 
            name: 'Good Friend'
            userId: 'defgh1234'
        },
        {
            name: 'Tom Tomson'
            userId: 'tomtom123'
        }
    ]
}```

For errors responses, see the [status documentation](#/error-codes).
