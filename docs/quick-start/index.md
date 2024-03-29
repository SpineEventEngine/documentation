---
title: Getting Started in Java
headline: Documentation
bodyclass: docs
layout: docs
next_btn: 
  page: Development Process Overview
---

# Getting started with Spine in Java

<p class="lead">This guide will walk you through a minimal client-server application in Java
which handles one command to print some text on behalf of the current computer user. The document
goes through already written code which is quite simple. So, it won't take long.
</p>

## What we'll do

We'll go through the example which shows a Bounded Context called “Hello”. 
The context has one `ProcessManager`, which handles the `Print` command
sent from the client-side code to the server-side code hosting the context. 
We'll go through the production code of the example suite, and through the code which
tests the Hello context.

## What you'll need

1.  JDK version 8 or higher.
2.  Git.
3.  The source code of the [Hello World](https://github.com/spine-examples/hello) example.
    
    ```bash
    git clone git@github.com:spine-examples/hello.git
    ```

## Run the code

To check that you've got everything installed, please run the following command:

```bash
./gradlew :sayHello
```

If you're under Windows, it would be:

```bat
gradlew.bat :sayHello
```

This would build and execute the example. 
The process should finish with the output which looks like this:

```
> Task :sayHello
Dec 18, 2020 5:32:11 PM io.spine.base.Environment setCurrentType
INFO: `Environment` set to `io.spine.base.Production`.
Dec 18, 2020 5:32:12 PM io.spine.server.Server lambda$start$1
INFO: In-process server started with the name `a7c62b63-2cc6-4679-bb92-072591142275`.
[savik] Hello World!
The client received the event: io.spine.helloworld.hello.event.Printed{"username":"savik","text":"Hello World!"}
Dec 18, 2020 5:32:15 PM io.spine.server.Server shutdown
INFO: Shutting down the server...
Dec 18, 2020 5:32:15 PM io.spine.server.Server shutdown
INFO: Server shut down.
```  

The first line tells which Gradle task we run. The following couple of lines is the server-side
logging that informs us that the server was started. 

The line with the `Environment` tells that we're running the application in the `Production` 
environment.
The line with “Hello World!” text is the “meat” of this example suite. 
It is what our `ProcessManager` (called `Console`) does in response to the `Print` command received
from the `Client`. 
The text in between brackets is the name of the current computer user. The name was passed as
the argument of the `Print` command.

<p class="note">We opted to show a `ProcessManager` — instead of an `Aggregate` — because
the console output is similar to an “External System”. Dealing with things like
that is the job of Process Managers. We also want to highlight the importance of using
this architectural pattern.</p>

The output that follows is the logging produced by the `Client` class as it receives the `Printed`
event from the server.

Then, the server shuts down concluding the example.   

Now, let's dive into the code.
 
## Project structure

For the sake of simplicity, this example is organised as a single-module Gradle project.
Most likely, a project for a real world application would be multi-module.

### The root directory

The root of the project contains the following files:
  * `LICENSE` — the text of the Apache v2 license under which the framework and
     this example are licensed.
  * `README.md` — a brief intro for the example.
  * `gradlew` and `gradlew.bat` — scripts for running Gradle Wrapper.
  * **`build.gradle`** — the project configuration. We'll review this file later
    [in details](#adding-spine-to-a-gradle-project).

<p class="note">The root directory also contains “invisible” files, names of which start with
the dot (e.g. `.gitattributes` and `.travis.yml`).
These files configure Git and CI systems we use. They are not directly related to the subject
of the example and this guide. If you're interested in this level of details,
please look into the code and comments in these files.
</p>    

Here are the directories of interest in the project root:
 * `gradle` — this directory contains the code of Gradle Wrapper and two Gradle scripts
    used in the [project configuration](#other-project-configuration).
 * **`generated`** — this directory contains the code generated by Protobuf Compiler and 
    Spine Model Compiler. This directory and code it contains is created automatically
    when a domain model changes. This directory is <em>excluded</em> from version control.
 * **`src`** — contains the handcrafted source code.

Let's see how the source code is structured.

### The `src` directory

The source code directory follows standard Gradle conventions and has two sub-directories:
  * **`main`** — the production code;
  * **`test`** — the tests for the production code.

The production code consists of two parts allocated by sub-directories:
  * **`proto`** — contains the definition of data structures in Google Protobuf.
    A domain model definition starts from adding the code to this directory. 
    Then, the Protobuf code is compiled to the languages of the project. 
    The output of this process is placed into the `generated` directory, with a sub-directory
    for each language. This example uses only Java.
    
  * **`java`** — this directory contains the model behavior and other server- and client-side code.
    A real project would have these parts in separate modules or projects. We put it all
    together for the sake of simplicity. 

Now, let's review the code in details, starting with how to add Spine to a Gradle project.

## Adding Spine to a Gradle project

Let's open `build.gradle` from the root of the project. The simplest and recommended way for
adding Spine dependencies to a project is the Bootstrap plugin:

<embed-code file="examples/hello/build.gradle"
            start="plugins"
            end="^}"></embed-code>
```gradle
plugins {
    id("io.spine.tools.gradle.bootstrap").version("1.7.0")
}
```

Once the plugin is added, we can use its features:

<embed-code file="examples/hello/build.gradle" 
            start="spine.enableJava()"
            end="spine.enableJava()"></embed-code>
```groovy
spine.enableJava().server()
```

This enables Java in the module and adds necessary dependencies and configurations.

<p class="note">Calling `spine.enableJava().server()` adds both server- and client-side dependencies.
This way a module of a Bounded Context “A” may be a client for a Bounded Context “B”. 
Client-side applications or modules should call: `spine.enableJava().client()`.
</p>

### Other project configuration

The rest of the `build.gradle` file does the following:
 1. Sets the version of Java to 8.

 2. Adds JUnit dependencies by applying the `tests.gradle` script plugin (which we extracted
    for the sake of simplicity). 
    
 3. Defines the `sayHello` task which runs the `Example` application, which orchestrates
    the demo.  

We are not reviewing these parts of the project configuration deeper because they are not
related to the use of the Spine framework. If you're interested in more details, please look into
the mentioned `.gradle` files.

Now, let's look into the data structure of the Hello context. 
 
## Hello context data

The data types of the Hello context are defined under the `src/main/proto/hello` directory with
the following files:

  * **`commands.proto`** — this file defines the `Print` command.
  
    <p class="note">By convention, commands are defined in a file with the `commands` suffix
     in its name. It can be, for example, `order_commands.proto` or just `commands.proto`
     like in our example.</p>
     
  * **`events.proto`** — this file defines the `Printed` event.
  
    <p class="note">Similarly to commands, events are defined in proto files having the `events`
    suffix in their names.</p>

These two files define signals used by the Hello context. There's also data of the `Console`
Process Manager, which is defined in the package **`server`** in the file **`console.proto`**.

<p class="note">
We arrange the sub-package `server` to highlight the fact that this is server-only data. It is not
a convention used by the framework. We find the clarity of this infix useful when creating
cloud applications. So, we share it as a recommendation in this example.</p>

Let's review the context data definition in details.

### The `commands.proto` file

After the copyright header the file starts with the syntax declaration. The framework supports only
this version of the Protobuf dialect:
```proto     
syntax = "proto3";
```

Then follows the import statement for custom options used when defining data types. This import is
required for all proto files of a Spine-based project.

<embed-code file="examples/hello/src/main/proto/hello/commands.proto" 
            start="spine/options"
            end="spine/options"></embed-code>  
```proto
import "spine/options.proto";
```

The following file-wide option defines the prefix for type names used in this file.

<embed-code file="examples/hello/src/main/proto/hello/commands.proto" 
            start="type_url_prefix"
            end="type_url_prefix"></embed-code>  
```proto
option (type_url_prefix) = "type.spine.io";
```

This prefix is needed for recognizing binary data when it's unpacked. Most likely, all types
in a system would use the same prefix.

Then we see the standard Protobuf option for defining a Java package for the generated code:

<embed-code file="examples/hello/src/main/proto/hello/commands.proto" 
            start="java_package"
            end="java_package"></embed-code>  
```proto
option java_package="io.spine.helloworld.hello.command";
``` 

There are three parts of interest in this package name:
  * **`io.spine.helloworld`** — this part represents the location of our Hello World “solution”
    as if it were hosted on the web at `https://helloworld.spine.io`.
     
  * **`hello`** — this is the package of the Hello context. In this example we have only one, but
     a real world app would have more. Each Bounded Context goes into a dedicated package.
     
  * **`command`** — this part gathers commands of the context under one package.
     We have only one command in this example, but in real world scenarios, with dozens of commands,
     it is convenient to gather them under a package.  

The following standard proto file option defines the name for the outer class generated by
Protobuf Compiler for this `.proto` file: 

<embed-code file="examples/hello/src/main/proto/hello/commands.proto" 
            start="java_outer_classname"
            end="java_outer_classname"></embed-code>  
```proto
option java_outer_classname = "CommandsProto";
```

<p class="note">Outer classes are used by Protobuf implementation internally.
When the `java_outer_classname` option is omitted, Protobuf Compiler would calculate the Java
class name taking the name of the corresponding `.proto` file. 
We recommend setting the name directly to make it straight. This also avoids possible name clashes
with the handcrafted code.</p> 

The next standard option instructs the Protobuf Compiler to put each generated Java type into
a separate file. This way it would be easier to analyze dependencies of the code which uses these
generated types.

<embed-code file="examples/hello/src/main/proto/hello/commands.proto" 
            start="java_multiple_files"
            end="java_multiple_files"></embed-code>  
```proto
option java_multiple_files = true;
```

The command for printing a text in a console is defined this way:

<embed-code file="examples/hello/src/main/proto/hello/commands.proto" 
            start="message Print" 
            end="^}"></embed-code>  
```proto
message Print {

    // The login name of the computer user.
    string username = 1;

    // The text to print.
    string text = 2 [(required) = true];
}
```

By convention, the first field of a command is the ID of the target entity.
This field is required to have a non-empty value so that the command can be dispatched to
the entity. In our case, we identify a console by the login name of the computer user.  

The second field is marked as `(required)` using the custom option imported in
the `spine/options.proto` file above. This command does not make much sense if there is no text
to print.

<p class="note">In Protobuf a data type is either a **`message`** (we can send it) or an **`enum`**.
If you're new to this language, you may want to look at the [Proto3 Language Guide][proto3-guide].  
</p>

Now, let's see how to define events. 

### The `events.proto` file

Events are declared similarly to commands. The header of the file has:

 * The `proto3` syntax declaration.
 * The `hello` package declaration.
 * The import statement for custom Protobuf options used by the framework:
    
    ```proto
    import "spine/options.proto";
    ```

 * The same `(type_url_prefix)` we use in this project.
 * A separate Java package for events of the context:
    
    ```proto
    option java_package="io.spine.helloworld.hello.event";
    ```
   
 * The outer Java class for all types in this file:
 
    ```proto
    option java_outer_classname = "EventsProto";
    ```     
    
 * The instruction to put Java types into separate files.

    ```proto
    option java_multiple_files = true;
    ```

The sole event in this project is declared this way:

<embed-code file="examples/hello/src/main/proto/hello/events.proto" 
            start="message Printed" 
            end="^}"></embed-code>
```proto 
message Printed {

    // The login name of the user.
    string username = 1 [(required) = true];

    // The printed text.
    string text = 2 [(required) = true];
}
```

The event tells which text was printed for a user. Both of the fields are marked as `(required)`
because the event does not make much sense if one of them is empty. 

<p class="note">
Unlike for commands, the framework does not assume that the first event field is <em>always</em>
populated. This is so because default routing rules for commands and events are different. 
When an event is produced by some entity, it remembers the ID of this producer entity. 
By default, the framework uses the producer ID to route events to their target entities — 
if they have identifiers of the same type.  If the type of producer ID does not match one of the
target entity, then event fields are analyzed. It is also possible to set custom routing rules.
</p>   

Now, let's see the server-side data of the Hello context.

### The `console.proto` file

The header of the file is similar to those we saw in `commands.proto` and `events.proto`. 
The difference is that we use `server` for the proto and Java package names to make sure the 
server-only is not used by the client code.
 
This file defines a single data type. It is the state of the entity handling the `Print` command:

<embed-code file="examples/hello/src/main/proto/hello/server/console.proto" 
            start="message Output" 
            end="^}"></embed-code>
```proto
message Output {
    option (entity) = { kind: PROCESS_MANAGER };

    // The login name of the computer user.
    string username = 1;

    // Text lines of the screen.
    repeated string lines = 2;
}
```

The option `(entity)` tells us that this type is going to be used by a `ProcessManager`.
The first field of the type holds the ID of this entity. The framework assumes such fields as
implicitly `(required)`. Then goes the declaration of the remote screen output.  The value of this
field is empty until something is printed on the screen. Therefore, it is not marked `(required)`.

Now, let's see how this data is used at the server-side.

## The `Console` class

The class is declared this way:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/Console.java" 
            start="class Console" end="class Console"></embed-code>
```java
final class Console extends ProcessManager<String, Output, Output.Builder> {
```

The generic arguments passed to `ProcessManager` are:
 1. `String` — the type of the ID of the entity. Remember the type
of the first field of the `Print` command?

 2. `Output` — the type of the entity state, which we reviewed in the previous section.

 3. `Output.Builder` — the type used to modify the state of the entity.
    In Protobuf for Java, each message type has a specific builder type. 

### Handling the `Print` command

The command is handled by this method:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/Console.java" 
            start="@Assign" 
            end="^    }"></embed-code>
```java
@Assign
Printed handle(Print command) {
    String username = command.getUsername();
    String text = command.getText();
    builder().setUsername(username)
             .addLines(text);
    println(username, text);
    return Printed.newBuilder()
            .setUsername(username)
            .setText(command.getText())
            .vBuild();
}
```

Let's review the method in details.

The `@Assign` annotation tells that we assign this method to handle the command which the
method accepts as the parameter. The method returns the event message `Printed`.

The following code obtains the name of the user, and the text to print from the received command,
and then applies them to the state of the Process Manager. Instances of the `Console` class store
the text printed for each user.

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/Console.java" 
            start="String username" 
            end="addLines(text);"></embed-code>
```java
String username = command.getUsername();
String text = command.getText();
builder().setUsername(username)
         .addLines(text);
```
  
Then we print the text to `System.out` so that it becomes visible on the screen:    

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/Console.java" 
            start="*println(username*" 
            end="*println(username*"></embed-code>
```java
println(username, text);
```

This is done by the method the `Console` class declares:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/Console.java" 
            start="private void println(" 
            end="    }"></embed-code>
```java
private void println(String userName, String text) {
    String output = format("[%s] %s", userName, text);
    System.out.println(output);
}
```

Then, the command-handling method concludes by producing the event message:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/Console.java" 
            start="return Printed" 
            end="vBuild();"></embed-code>
```java
return Printed.newBuilder()
        .setUsername(username)
        .setText(command.getText())
        .vBuild();
```

The `vBuild()` call validates and builds the message. This method is generated by Spine Model
Compiler. For instructions on adding validation attributes to your model please see 
[Validation User Guide]({{site.baseurl}}/docs/guides/validation). 

<p class="note">After the event is generated, it is posted to the `EventBus` and delivered to
subscribers automatically. You don't need to write any code for this.</p>  

Now, let's see how the `Console` Process Manager is exposed to the outer world so that it can
receive commands.

## Assembling the Hello context

Let's open the `HelloContext` class. The first thing of interest in this class is the declaration of
the name of the Bounded Context:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/HelloContext.java" 
            start="NAME"
            end="NAME"></embed-code>
```java
static final String NAME = "Hello";
```

This constant is used for creating the context (we will review it in a minute) and when annotating
the server-side code which belongs to the Hello context. This is done in `package-info.java` using
the `@BoundedContext` annotation:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/package-info.java" 
            start="@BoundedContext" 
            end="package"></embed-code>
```java
@BoundedContext(HelloContext.NAME)
package io.spine.helloworld.server.hello;
```

<p class="note">The framework assumes that all entity classes belonging to this and nested packages
belong to the Bounded Context with the name specified in the argument of the annotation.
This arrangement is needed for routing events.</p>

The second thing the `HelloContext` does is creating a Builder for the Bounded Context:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/hello/HelloContext.java" 
            start="newBuilder()" 
            end="    }"></embed-code>
```java
public static BoundedContextBuilder newBuilder() {
    return BoundedContext
            .singleTenant(NAME)
            .add(Console.class);
}
```

The context we create is single-tenant. It contains one entity type which we pass to the builder.
 
<p class="note">If an entity uses default routing rules for the incoming events and commands,
its type can be added to `BoundedContextBuilder` directly. If custom routing rules are needed,
they are specified by a custom `Repository` class. In this case, an instance of such `Repository`
is passed to `BoundedContextBuilder` instead of the entity type managed by this `Repository`.</p>

Once we assembled the Bounded Context, let's test it.
 
## Testing the Hello context

Let's open the `HelloContextTest` suite. It is based on JUnit 5 and `spine-testutil-server` library.

<p class="note">We already added JUnit dependency when defining the Gradle project.
The `testImplementation` dependency for `spine-testutil-server` is automatically added when
you enable Spine in your project using `spine.enableJava().server()`. So, we're good to go testing.</p>

The class of the test suite extends the abstract base called `ContextAwareTest`:

<embed-code file="examples/hello/src/test/java/io/spine/helloworld/server/hello/HelloContextTest.java" 
            start="@DisplayName(*Hello*)" 
            end="class HelloContextTest"></embed-code>
```java
@DisplayName("Hello context should")
class HelloContextTest extends ContextAwareTest {
```

The base class is responsible for creation of a test fixture for a Bounded Context under
the test before each test, and for disposing the fixture after. The fixture is accessed using
the `context()` method.

We pass the Hello Context for testing using its builder by implementing the abstract method
`contextBuilder()` inherited from `ContextAwareTest`: 

<embed-code file="examples/hello/src/test/java/io/spine/helloworld/server/hello/HelloContextTest.java" 
            start="@Override" 
            end="    }"></embed-code>
```java
@Override
protected BoundedContextBuilder contextBuilder() {
    return HelloContext.newBuilder();
}
```
Now we can get down to the tests. The suite verifiers the outcome of the `Print` command.
The test methods are gathered under the nested class called
`PrintCommand`. The class holds the reference to the command as its field:

<embed-code file="examples/hello/src/test/java/io/spine/helloworld/server/hello/HelloContextTest.java" 
            start="@Nested" 
            end="private Print command;"></embed-code>
```java
@Nested
@DisplayName("handle the `Print` command")
class PrintCommand {

    private Print command;
```

### Sending the command

The command is created and sent to the test fixture before each test method:

<embed-code file="examples/hello/src/test/java/io/spine/helloworld/server/hello/HelloContextTest.java" 
            start="@BeforeEach" 
            end="*}"></embed-code>
```java
@BeforeEach
void sendCommand() {
    command = Print.newBuilder()
            .setUsername(randomString())
            .setText(randomString())
            .vBuild();
    context().receivesCommand(command);
}
```

For test values we use statically imported `randomString()` method of the `TestValues` utility class
provided by the `spine-testutil-server` library. We use the `context()` method provided by
`ContextAwareTest` for obtaining the reference of the test fixture of the Bounded Context
under the test.

Now we need to test that handling the command produces the event, and the handling entity updates
its state. 

### Testing creation of the event

Testing that an event was generated is quite simple. We create the expected event and assert it
with the test fixture:

<embed-code file="examples/hello/src/test/java/io/spine/helloworld/server/hello/HelloContextTest.java" 
            start="@Test @DisplayName(*event*)" 
            end="*}"></embed-code>
```java   
@Test @DisplayName("emitting the `Printed` event")
void event() {
    Printed expected = Printed.newBuilder()
            .setUsername(command.getUsername())
            .setText(command.getText())
            .build();
    context().assertEvent(expected);
}
```

### Testing entity state update

For testing the state of the `Console` Process Manager was updated, we construct the expected
state and pass it to the `assertState()` method of the test fixture:

<embed-code file="examples/hello/src/test/java/io/spine/helloworld/server/hello/HelloContextTest.java" 
            start="@Test @DisplayName(*entity*)" 
            end="*}"></embed-code>
```java
@Test @DisplayName("updating the `Console` entity")
void entity() {
    Output expected = Output.newBuilder()
            .setUsername(command.getUsername())
            .addLines(command.getText())
            .vBuild();
    context().assertState(command.getUsername(), expected);
}
```

The first argument passed to the `assertState()` method is the ID of the entity the state of which
we test. The second argument is the expected state.


Now as we've checked that our Bounded Context works correctly, let's expose it in
the server-side application.

## The server-side application 

Let's open the `Server` class of our example application suite. The static initialization of 
the class configures the server environment:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/Server.java" 
            start="static {" 
            end="    }"></embed-code>
```java
static {
    configureEnvironment();
}
```

### Configuring the environment

The `configureEnvironment()` method initializes the `Production` environment of this example with
the settings that are normally used for testing:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/Server.java" 
            start="void configureEnvironment()" 
            end="    }"></embed-code>
```java
private static void configureEnvironment() {
    ServerEnvironment.when(Production.class)
            .use(InMemoryStorageFactory.newInstance())
            .use(Delivery.localAsync())
            .use(InMemoryTransportFactory.newInstance());
}
``` 

A real-world application would use `StorageFactory` and `TransportFactory` instances that correspond
to a database, and a messaging system used by the application. 

### The constructor

The implementation of the `Server` class wraps around the class `io.spine.server.Server` provided
by the framework. This API is for exposing `BoundedContext`s in a server-side application.
This is what our `Server` class does in the constructor:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/server/Server.java" 
            start="public Server(" 
            end="    }"></embed-code>
```java
public Server(String serverName) {
    this.server = inProcess(serverName)
            .add(HelloContext.newBuilder())
            .build();
}
```

The constructor accepts the name which is used for connecting clients. This name
is passed to the `inProcess()` factory method of the `io.spine.server.Server` class. 

<p class="note">In-process gRPC communications are normally used for testing.
This example uses in-process client/server arrangement in the production code for
the sake of simplicity. A real-world application would use a `Server` instance exposed
via a TCP/IP port.</p>

Once we have the `Server.Builder` instance returned by the `inProcess()` method,
we add the Hello Context via its builder to the constructed `Server` instance.

### Start and shutdown

The remaining code of our `Server` class declares `start()` and `shutdown()` methods that
simply delegate calls to the wrapped `io.spine.server.Server` instance.  

Now we have the server, but how does the client side look like?

## The client code

Similarly to `Server`, the `Client` class of our example application wraps around
the `io.spine.client.Client` API provided by the `spine-client` library: 

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/client/Client.java" 
            start="class Client" 
            end="client;"></embed-code>
```java
public final class Client {

    private final io.spine.client.Client client;
```

<p class="note">The `io.spine:spine-client` library is provided
to the example application project as a transitive dependency of
the `io.spine:spine-server` library, which is added to the project when you do
`spine.enableJava().server()` in your Gradle project.</p>

Then, the `Client` class declares a field for keeping subscriptions to the results of a command
execution. We'll see how this field is used in a minute. 

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/client/Client.java" 
            start="private @Nullable ImmutableSet"
            end="private @Nullable ImmutableSet"></embed-code>
```java
private @Nullable ImmutableSet<Subscription> subscriptions;
```

First of all, let's see how the `Client` instances are created.

### The constructor

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/client/Client.java" 
            start="public Client(" 
            end="    }"></embed-code>
```java
public Client(String serverName) {
    this.client = inProcess(serverName)
            .shutdownTimeout(2, TimeUnit.SECONDS)
            .build();
}
```

Again, similarly to a `Server`, a `Client` is created using in-process connection to a named server.
The `shutdownTimeout` parameter configures the amount of time allowed for completing ongoing
client-server communications. 

Now, let's review the main thing the `Client` class does, sending the `Print` command.

### Sending the command

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/client/Client.java" 
            start="sendCommand() {" 
            end="    }"></embed-code>
```java
public void sendCommand() {
    String userName = System.getProperty("user.name");
    Print commandMessage =
            Print.newBuilder()
                 .setUsername(userName)
                 .setText("Hello World!")
                 .vBuild();
    this.subscriptions =
            client.asGuest()
                  .command(commandMessage)
                  .observe(Printed.class, this::onPrinted)
                  .post();
}
```

The method does three things:
   1. Creates a command message using the login name of the current computer user.
   2. Subscribes to the `Printed` event which will be generated as the result of
      handling the command we are going to post (and only this instance of the command,
      not all `Print` commands).  
   3. Posts the command. 
      
Let's review subscribing and posting in details.
   
The `client.asGuest()` call starts composing a client request. For the sake of simplicity,
we do this on behalf of a user who is not logged in. A real-world application would send
most of the commands using `client.onBehalfOf(UserId)`.

The `command(commandMessage)` call tells we want to send a command with the passed message.

Then, we subscribe to the `Printed` event which would be generated as the result of handling
the command. The events obtained from the server would be passed to the `onPrinted()` method
of the `Client` class.

The `post()` method sends the command to the server, returning the set with one `Subscription`
to the `Printed` event. We store the returned set in the field to use later for cancelling
the subscription.  

### Handling the event

When the client code receives the `Printed` event, it prints its data and then 
cancels the subscription:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/client/Client.java" 
            start="void onPrinted(" 
            end="    }"></embed-code>
```java
private void onPrinted(Printed event) {
    printEvent(event);
    cancelSubscriptions();
}
```

There's not much exciting about the printing part.

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/client/Client.java" 
            start="void printEvent(" 
            end="    }"></embed-code>
```java
private void printEvent(EventMessage e) {
    String out = format(
            "The client received the event: %s%s",
            e.getClass()
             .getName(),
            toCompactJson(e)
    );
    System.out.println(out);
}
```

The only interesting thing here is the statically imported `Json.toCompactJson()` call which 
converts the event message to a `String`. The method is available from the `Json` utility class
provided by the framework. The utility does heavy lifting of the conversion which involves knowing
all Protobuf types available in the project.
 
Cancelling the subscription, if any, iterates through the set passing each of them to
the `Client.subscriptions()` API for the cancellation:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/client/Client.java" 
            start="void cancelSubscriptions()" 
            end="^    }"></embed-code>
```java
private void cancelSubscriptions() {
    if (subscriptions != null) {
        subscriptions.forEach(s -> client.subscriptions().cancel(s));
        subscriptions = null;
    }
}
```  

Once we finish with the cancellation, we clear the `subscriptions` field.

### Closing the client

The `close()` method simply delegates to the method of the `io.spine.client.Client` class.
We also need to tell the calling code if the client has finished its job. 
This is what the `isDone()` method is for:

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/client/Client.java" 
            start="boolean isDone()" 
            end="    }"></embed-code>
```java
public boolean isDone() {
    return client
            .subscriptions()
            .isEmpty();
}
```

The method checks active subscriptions. If there are none, we got the event and cleared its
subscription.

Now, let's put it all together.

## Orchestrating the example

Let's review the `Example` class and its `main()` method. It simulates client-server communication
scenario.

<embed-code file="examples/hello/src/main/java/io/spine/helloworld/Example.java" 
            start="void main(" 
            end="^    }"></embed-code>
```java
public static void main(String[] args) {
    String serverName = Identifier.newUuid();
    Server server = new Server(serverName);
    Client client = null;
    try {
        server.start();
        client = new Client(serverName);
        client.sendCommand();
        while (!client.isDone()) {
            sleepUninterruptibly(Duration.ofMillis(100));
        }
    } catch (IOException e) {
        onError(e);
    } finally {
        if (client != null) {
            client.close();
        }
        server.shutdown();
    }
}
```

The first thing the method does is creating a `Server` using a random name.

Then, the server is started. It is done in the `try/catch/finally` block because the `start()` 
method may throw `IOException` in case of communication problems reported by gRPC. 
The `catch` block calls the `onError()` method of the `Example` class which simply prints
the exception. A real-world application would use more sophisticated exception handling.
 
After the `Server` is started, we create a `Client` using the name of the server generated before.
Then, the client sends the command, and we wait until the client finishes its job using
the statically imported method `sleepUninterruptibly()` provided by Guava.

The `main()` method finishes by closing the client, and shutting down the server.  

## Summary

Although the “business case” of this example is trivial, it shows basic steps of development 
of a solution based on Spine Event Engine framework. 

The development starts with the discovery of the business using EventStorming or another
learning approach.

Then, we select a Bounded Context and define events, commands, Value Objects, and entity states
using Protobuf. Using these `.proto` files Spine Model Compiler generates the code implementing
the defined data types.

After that, we add the business logic for handling commands or events in entity classes derived from
`Aggregate`, `ProcessManager`, or `Projection`. 

Then,  these entity types are assembled into a Bounded Context and tested as a whole.
A test suite sends signals (i.e. commands or events) to the implementation of the Bounded Context
and verifies the changes manifested as events or new entity states.

Once the Bounded Context is tested, it is added to a `Server` which gathers all the Bounded Contexts
of the solution and accepts incoming requests from the client applications. 

Client applications send commands to modify the business model and subscribe to messages
like events that reflect the changes of the model.

Once handling of all commands and events of the selected Bounded Context is done, another
context is selected for the development. The process is repeated until all the contexts
are implemented. 

[proto3-guide]: https://developers.google.com/protocol-buffers/docs/proto3
