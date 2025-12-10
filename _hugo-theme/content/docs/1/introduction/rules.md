---
title: Rules
headline: Documentation
---

# Rules

Here are the ground rules the framework is built upon:

1. An update to a business model _is_ an event. 

2. Entities are changed in response to events.
   
3. A command has one and _only one_ handler.

4. A command _must_ result in an event, a rejection, or other commands.

5. Events are _always_ appended. Never deleted or edited.
