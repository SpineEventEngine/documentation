---
title: Development Process
headline: Documentation
bodyclass: docs
layout: docs
---
# Development Process

<p class="lead">Building a solution based on Spine Event Engine framework is an iterative process
which consists of the stages described in this document.</p>
 
## Getting domain knowledge

The purpose of this step is to find out what we're going to build and why.
Consider using [EventStorming](https://eventstorming.com) or another domain discovery 
approach for grasping the knowledge from the experts.
 
Most likely that the solution would have several [Bounded Contexts](concepts#bounded-context). 
For each context developers need to define:
  * <strong>Signals</strong>
    - [Events](concepts#event)
    - [Commands](concepts#command)
    - [Rejections](concepts#rejection)
  * <strong>Entities</strong>  
    - [Aggregates](concepts#aggregate) 
    - [Process Managers](concepts#process-manager)
    - [Projections](concepts#projection).

It is likely that some of the bits of this picture would change during the process.
But the whole team, including domain experts, need to have complete understanding of how the 
business works to avoid “surprises” down the road. 

We return to learning the domain when we discover inconsistencies in the model,
or we need more information about how the business works, or the business wants to develop further
and we need to update the model.

Once we got enough domain knowledge we proceed to the implementation. 

## Implementing a Bounded Context

At this stage we select one of the Bounded Contexts for the implementation.
Each context is developed separately. In this sense it can be seen as a microservice.
It would be natural to start implementing the context which initiates the business flow.

### Defining data types

Implementation starts from defining data types of the selected context as Protobuf messages.

The first step is to define entity [IDs](concepts#identifier). For example:
```proto
// The identifier for a task.
message TaskId {
    string uuid = 1;
}
```

Then commands, events, rejections are defined:
```proto
// A command to create a new task.
message CreateTask {
    TaskId id = 1;
    string name = 2 [(required) = true];
    string description = 3;
}
```

```proto
// A new task has been created.
message TaskCreated {
    TaskId task = 1;
    string name = 2 [(required) = true];
    string description = 3;
    UserId who_created = 4 [(required) = true];
}
```
 
Then we define states of entities.

```proto
message Task {
    option (entity).kind = AGGREGATE;
    TaskId id = 1;
    string name = 2 [(required) = true];
    string description = 3;
    UserId owner = 4 [(required) = true];
    DeveloperId assignee = 5;
}
```
 
[Value Objects]({{site.baseurl}}/docs/introduction/concepts#value-objects) are added when they 
are needed to describe entities or messages like commands or events.

### Adding business logic

The business logic of a Bounded Context is based on [Entities](#entities).
They handle messages updating the state in response. Entities like `Aggregate`s and
`ProcessManager`s can generate events. `ProcessManager`s can also generate new commands.
`Projection`s only consume events. 

Updating the state of the domain model in response to messages and generating new messages is
the “life” of the domain model. Messages are delivered to entities by [Repositories](#repositories).

#### Entities

During this step we create entity classes and add message handling methods to them. 
Code snippets below show `Aggregate` and `Projection` classes with their handler methods.

```java
final class TaskAggregate
    extends Aggregate<TaskId, Task, Task.Builder> {
    
    @Assign
    TaskCreated handle(CreateTask cmd, CommandContext ctx) {
        return TaskCreated
                .newBuilder()
                .setTask(cmd.getId())
                .setName(cmd.getName())
                .setDescription(cmd.getDescription())
                .setWhoCreated(ctx.getActor())
                .vBuild();
    }
    
    @Apply
    void event(TaskCreated e) {
        builder().setName(e.getName())
                 .setDescription(e.getDescription())
                 .setOwner(e.getWhoCreated());
    }
}
```

```java
final class TaskItemProjection
    extends Projection<TaskId, TaskItem, TaskItem.Builder> {

    @Subscribe
    void on(TaskCreated e) {
        builder().setTask(e.getTask())
                 .setName(e.getName())
    }

    @Subscribe
    void on(TaskCompleted e, EventContext ctx) {
        builder().setWhenDone(ctx.getTimestamp());
    }
}
```

#### Repositories
The framework provides default implementations for repositories.
A custom `Repository` class may be needed for:
  * <strong>Dispatching messages to entities in a non-standard way</strong>.
    By default, a command is dispatched using the first field of the command message
    as an ID of the target entity.
    An event is dispatched by the ID of the entity which emitted the event.
  * <strong>Domain-specific operations</strong> on entities of this kind.
  
Repositories are added to the Bounded Context they belong when it is created:

```java
BoundedContext tasksContext = BoundedContext.multiTenant("Tasks")
    .add(TaskAggregate.class) // use default repository impl.
    .add(new TaskItemProjectionRepository())
    .build();
```

This wires repositories into the message delivery mechanism of the corresponding
[Buses]({{site.baseurl}}/docs/introduction/concepts#message-buses).
  
#### Testing
Implementation of the Bounded Context is tested using the messaging paradigm.
The following code snippet asserts that handling a command `CreateTask` produces one 
`TaskCreated` event with expected arguments.

```java
// Given
BlackBoxBoundedContext context = BlackBoxBoundedContext.from(tasksContext);

// When
context.receivesCommand(createTask());

// Then
TaskCreated expected = TaskCreated.newBuilder()
    .setTask(id)
    .setName(name)
    .build();

EventSubject assertEvents = 
    context.assertEvents()
           .withType(TaskCreated.class)    

assertEvents.hasSize(1);
assertEvents.message(0)
       .comparingExpectedFieldsOnly()
       .isEqualTo(expected);  
```

Modification of entities is also tested. The following code snippet asserts that the state
of the `TaskAggregate` was also updated with expected arguments.

```java
EntitySubject assertEntity = 
    context.assertEntityWithState(Task.class, id);
Task expectedState = Task.newBuilder()
    .setId(id)
    .setName(name)
    .build();
assertEntity.hasStateThat()
    .comparingExpectedFieldsOnly()
    .isEqualTo(expectedState);
```

## Deployment

### Configuring Server Environment

For information on configuring server environment of a Spine-based application, please 
see the reference documentation of the [`ServerEnvironment`]({{site.core_api_doc}}/server/server/io.spine.server/-server-environment)
class.

### Assembling Application

The server-side application is composed with its Bounded Contexts.

```java
Server server = Server.atPort(portNumber)
    .add(tasksContext)
    .add(usersContext)
    .add(commentsContext)
    .build();
server.start();    
```

This exposes [`CommandService`]({{site.baseurl}}/docs/introduction/concepts#command-service), 
[`QueryService`]({{site.baseurl}}/docs/introduction/concepts#query-service), and 
[`SubscriptionService`]({{site.baseurl}}/docs/introduction/concepts#subscription-service) to client-side connections.

## Repeating the cycle

The stages described above are repeated as another Bounded Context is added to the implementation,
or as some changes or extensions to the existing contexts are required. 
 
## Client application development

Development of client applications may start after the [data types are defined](#defining-data-types).
Once this is done, developers run the Spine Model Compiler to generate the code for all supported
client platforms.
 
Since entity classes like `Projection` use composition with state types, you don't have to deal
with DTOs. You can start writing the code which subscribes or queries these types right after
they are defied in the `.proto` files, and the Model Compiler finishes its job.   
Client applications can also subscribe to events generated by Bounded Contexts at the backend. 

For more information on the client-side development, please refer to
the [Client Libraries]({{site.baseurl}}/docs/client-libs/) section.
