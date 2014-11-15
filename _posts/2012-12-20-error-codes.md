---
title: 'Statuses'

layout: nil
---

Each operation returns a response with a status attribute. If the status is **ok**, all is good. Else possible errors are:,

- **{status: error}** - Unrecognized error
- **{status: bad token}** - Invalid token
- **{status: bad endpoint}** - This endpoint does not specify a resource
- **{status: unauthorized}** - Absence of required permissions
- **{status: absent}** - Recognizes the endpoint, but currently has no data