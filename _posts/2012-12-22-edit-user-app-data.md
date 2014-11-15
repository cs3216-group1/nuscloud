---
category: user + app
path: '/:userId/:appId/*'
title: 'Edit user data for app'
type: 'POST'

layout: nil
---

This method edits user info for the app at the specified path.

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

* **Request body sent cannot be empty** and must include a **data** attribute containing the data to be put at the specified path. The data attribute can be either a Javascript Object or a primitive data type (Number, Boolean, String)

Special cases of this request substitute **me** for **:userId** to edit info of the logged in user and/or **app** for **:appid** to edit data for current logged in app.

As of now, this request can only be made by the currently logged in app.

This endpoint supports nesting. A request to */me/app/example* with this data:

```{
    data: {
        apples: 3
    }
}```

Is equivalent to this request to */me/app/example/apples*:

```{
    data: 3 
}```

### Response

The response contains the status of the operation.

```{
    status: 'ok' 
}```

For errors responses, see the [status documentation](#/error-codes).