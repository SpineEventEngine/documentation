---
title: Working with Rejections
headline: Documentation
bodyclass: docs
layout: docs
---
# Working with Rejections

Compared with regular Events, [Rejections]({{ site.baseurl }}/docs/introduction/concepts#rejection) 
are defined differently. Here is the summary of the differences:

1. `java_multiple_files` file option must be set to `false`

    By doing this we instruct Protobuf Compiler to put all the rejection classes in a single
    outer class. 
    Spine Model Compiler for Java generates `ThrowableMessage` classes for all these messages. 
    These classes will be named after the classes of rejection messages.
    Putting rejection message classes under an outer class avoids name clash inside the package.

2. Omit `java_outer_classname` option

    Thus, the outer class name is derived from the name of the file where rejection messages are
    declared. Usually the outer class names are named using the name with the suffix `Proto`. 
    We want the name to end with `Rejections` so that it is clearly visible what is inside
    this class.



