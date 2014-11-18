---
category: user + app
path: '/:userId/:appId/*'
title: 'Delete user data for app'
type: 'DELETE'

layout: nil
---

This method deletes users data for the specified app at the speicified path.

### Request

* The headers must include a **valid authentication token**.

If made through the SDK, this is handled in the SDK itself and can therefore be ignored.

Special cases of this request substitute **me** for **:userId** to delete info of the logged in user and/or **app** for **:appid** to delete data for current logged in app.

As of now, this request can only be made by the currently logged in app.

### Response

Returns the status of the delete operation.

```{
    status: 'ok'
}```

For errors responses, see the [status documentation](#/error-codes).
