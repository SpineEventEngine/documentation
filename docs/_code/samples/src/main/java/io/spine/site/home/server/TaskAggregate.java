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

import io.spine.core.CommandContext;
import io.spine.site.home.Task;
import io.spine.site.home.TaskId;
import io.spine.site.home.command.AssignTask;
import io.spine.site.home.command.CompleteTask;
import io.spine.site.home.command.CreateTask;
import io.spine.site.home.event.TaskAssigned;
import io.spine.site.home.event.TaskCompleted;
import io.spine.site.home.event.TaskCreated;
import io.spine.server.aggregate.Aggregate;
import io.spine.server.aggregate.Apply;
import io.spine.server.command.Assign;

final class TaskAggregate extends Aggregate<TaskId, Task, Task.Builder> {

    @Assign
    TaskCreated handle(CreateTask cmd, CommandContext ctx) {
        return TaskCreated.newBuilder()
                    .setTask(cmd.getId())
                    .setName(cmd.getName())
                    .setDescription(cmd.getDescription())
                    .setOwner(ctx.getActorContext().getActor())
                    .vBuild(); // validate the event
    }

    @Apply
    private void event(TaskCreated e) {
        builder().setName(e.getName())
                 .setDescription(e.getDescription())
                 .setOwner(e.getOwner());
    }

    @Assign
    TaskCompleted handle(CompleteTask cmd) {
        return TaskCompleted.newBuilder()
                .setTask(cmd.getTask())
                .vBuild();
    }

    @Apply
    private void event(TaskCompleted e) {
        setArchived(true);
    }

    @Assign
    TaskAssigned handle(AssignTask cmd) {
        return TaskAssigned.newBuilder()
                .setAssignee(cmd.getAssignee())
                .vBuild();
    }

    @Apply
    private void event(TaskAssigned e) {
        builder().setAssignee(e.getAssignee());
    }
}
