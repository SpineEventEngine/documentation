/*
 * Copyright 2026 CodeMatters, Lda.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

package io.spine.site.home.server;

import io.spine.server.BoundedContextBuilder;
import io.spine.site.home.Task;
import io.spine.site.home.TaskId;
import io.spine.site.home.TaskItem;
import io.spine.site.home.command.CreateTask;
import io.spine.site.home.event.TaskCreated;
import io.spine.testing.server.blackbox.ContextAwareTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.spine.testing.TestValues.randomString;

@DisplayName("Handling `CreateTask` command should")
public class TaskCreationTest extends ContextAwareTest {

    private TaskId task;
    private String name;
    private String description;

    @Override
    protected BoundedContextBuilder contextBuilder() {
        return NanoPmContext.newBuilder();
    }

    private CreateTask generateCommand() {
        task = TaskId.generate();
        name = randomString();
        description = randomString();
        return CreateTask.newBuilder()
                   .setId(task)
                   .setName(name)
                   .setDescription(description)
                   .vBuild();
    }

    @BeforeEach
    void postCommand() {
        CreateTask cmd = generateCommand();
        context().receivesCommand(cmd);
    }

    @Test
    @DisplayName("generate `TaskCreated` event")
    void eventGenerated() {
        TaskCreated expected = expectedEvent();
        context().assertEvent(TaskCreated.class)
                 .comparingExpectedFieldsOnly()
                 .isEqualTo(expected);
    }

    private TaskCreated expectedEvent() {
        return TaskCreated.newBuilder()
                .setTask(task)
                .setName(name)
                .setDescription(description)
                .buildPartial();
    }

    @Test
    @DisplayName("create a `Task`")
    void aggregateCreation() {
        Task expected = expectedAggregateState();
        context().assertEntityWithState(task, Task.class)
                 .hasStateThat()
                 .comparingExpectedFieldsOnly()
                 .isEqualTo(expected);
    }

    private Task expectedAggregateState() {
        return Task.newBuilder()
                   .setId(task)
                   .setName(name)
                   .setDescription(description)
                   .buildPartial();
    }

    @Test
    @DisplayName("create a `TaskItem`")
    void projectionCreation() {
        TaskItem expected = expectedProjectionState();
        context().assertEntityWithState(task, TaskItem.class)
                 .hasStateThat()
                 .comparingExpectedFieldsOnly()
                 .isEqualTo(expected);
    }

    private TaskItem expectedProjectionState() {
        return TaskItem.newBuilder()
                .setName(name)
                .setDescription(description)
                .buildPartial();
    }
}
