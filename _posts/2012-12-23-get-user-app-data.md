---
category: user + app
path: '/:userId/:appId/*'
title: 'Get user data for app'
type: 'GET'

layout: nil
---

This method returns users data for the specified app at the specified path.

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

Special cases of this request substitute **me** for **:userId** to get info of the logged in user and/or **app** for **:appid** to get data for current logged in app.

If not made by the app itself, requires **(app-namespace)-read** permission, where (app-namespace) is the namespace of the app whose data would be read

### Response

Sends back an object containing info stored at the path.

This endpoint supports nesting. In a case where a request to */me/app/example* returns this:

```{
    status: 'ok',
    data: {
        category: 'basket',
        apples: 3,
        type: 'fresh',
    }
}```

Then a request to */me/app/example/apples* would return this:

```{
    status: 'ok',
    data: 3 
}```

For errors responses, see the [status documentation](#/error-codes).
