---
title: Architecture 
headline: Documentation 
customjs: js/docs/architecture-diagram.js
---

# Application Architecture

A Spine-based application consists of several Bounded Contexts. Client applications interact 
with the server-side via `CommandService`, `QueryService`, and `SubscriptionService`.

The diagram below shows <span id="display-all-components">all server-side components</span>
of a cloud application. When developing with Spine, you will be interacting
with only <em><span id="display-user-facing-components">some of them</span></em>, which
are not shaded on the diagram. The rest is handled by the framework.

Click on a component to navigate to its definition from the 
[Concepts](docs/introduction/concepts/)&nbsp;page.

<div class="diagram-box">
<div class="diagram-actions">
{{< diagram-link
    label="View full screen"
    icon_class="far fa-expand"
    url="docs/introduction/diagrams/spine-architecture-diagram-full-screen" >}}

{{< diagram-link
    label="Download PDF"
    icon_class="icon-pdf"
    url="docs/introduction/diagrams/Spine-Architecture-Diagram.pdf"
    is_external="true"
    class="download-pdf-link" >}}
</div>
{{< read-relative-asset "diagrams/spine-architecture-diagram.svg" >}}
</div>
