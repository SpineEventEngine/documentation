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

import io.spine.core.EventContext;
import io.spine.core.Subscribe;
import io.spine.core.UserId;
import io.spine.site.home.TaskId;
import io.spine.site.home.TaskItem;
import io.spine.site.home.event.TaskAssigned;
import io.spine.site.home.event.TaskCompleted;
import io.spine.site.home.event.TaskCreated;
import io.spine.server.projection.Projection;

final class TaskProjection extends Projection<TaskId, TaskItem, TaskItem.Builder> {

    @Subscribe
    void on(TaskCreated e) {
        builder().setName(e.getName())
                 .setDescription(e.getDescription())
                 .setOwner(toPersonName(e.getOwner()));
    }

    @Subscribe
    void on(TaskAssigned e) {
        builder().setAssignee(toPersonName(e.getAssignee()));
    }

    @Subscribe
    void on(TaskCompleted e, EventContext ctx) {
        builder().setWhenDone(ctx.getTimestamp());
    }

    /**
     * Returns always the same mock name because this code is not going to be shown
     * at the site pages.
     */
    private static String toPersonName(@SuppressWarnings("unused") UserId user) {
        return "John Doe";
    }
}
