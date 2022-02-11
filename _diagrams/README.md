The `_diagrams` folder is only used to store diagram source files and will be ignored by Jekyll 
when building the site.

# Tools

The diagram was created in [Sketch](https://www.sketch.com/) and exported using the 
[Sketch Interactive Export](https://github.com/mathisonian/sketch-interactive-export) plugin, 
which allows creating class names inside the exported SVG.

# How it works

## Add classes in Sketch

Add a layer or group name like `.g-caption`. 
The resulting SVG markup will contain `class="g-caption"`.

To have several classes for the one element add `.g-caption.command-dispatcher`. 
The result will be `class="g-caption command-dispatcher"`.

A layer name without a prefixed period will be used as ID.
For example, `g-caption.command-dispatcher` will result `id="g-caption" class="command-dispatcher"`.

## Export SVG

1. Select the diagram artboard.
2. Go to the right sidebar.
3. Click the "Make exportable" button (needs to be done only once for the artboard).
4. Select the `SVG` file format and click "Export Selected..." at the bottom of the panel.


# Diagram classes

Here is the list of marker CSS classes for the SVG image along with their meanings.

```
* outer-frame — the outer frame of the whole image;
* arrow-caption — a DIV with the caption over an arrow;
* box-caption — a DIV with the caption in some container;
* title-caption — a title;
* rect — a `rect` element;
* path — a `path` element;
* arrow — an arrow;
* layer-x — an X-th layer in stacked boxes such as 'Bounded Context';
* border — a border;
* brace - a brace;
* path-only - for a path that doesn't have a fill-color, only a stroke.


Elements and their parts:

* bounded-context;
* command-bus;
* events;
* event-store;
* ui;
* command-service;
* query-service;
* subscription-service;
* stand;
* event-bus;
* system-context-top;
* system-context-bottom;
* command-dispatcher;
* command-store;
* aggregate-mirror;
* pm-repo;
* aggregate-repo;
* projection-repo;
* write-side;
* read-side.


Arrows, composed as "from-to":

* command-dispatcher-pm-repo — an arrow from Command Dispatcher to PM repo group;
* integration-events;
* ui-command-service;
* ui-query-service;
* query-service-ui;
* ui-subscription-service;
* subscription-service-ui;
* query-service-stand;
* subscription-service-stand;
* command-service-command-bus;
* stand-query-service;
* event-bus-event-store;
* event-bus-projection-repo;
* command-bus-command-dispatcher;
* command-dispatcher-command-store;
* stand-projection-repo;
* stand-pm-repo;
* stand-aggregate-mirror;
* aggregate-states;
* aggregate-mirror-stand;
* stand-subscription-service;
* aggregate-repo-aggregate-commands;
* aggregate-repo-aggregate-events;
* aggregate-event-bus;
* event-bus-aggregate-repo;
* pm-command-bus;
* pm-repo-pm-commands;
* pm-repo-pm-events;
* pm-event-bus;
* event-bus-pm-repo;
* command-service-ui;
* command-bus-command-service;
* projection-repo-projection-events.


The marker for elements facing to the framework end-users:

* end-user.
```
