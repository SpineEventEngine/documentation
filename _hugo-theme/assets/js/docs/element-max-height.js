/*
 * Copyright 2025, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Redistribution and use in source and/or binary forms, with or without
 * modification, must retain the above copyright notice and the following
 * disclaimer.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

/**
 * Sets the `max-height` property to an element with the `.set-max-height` class.
 *
 * <p>The `max-height` value is calculated depending on the current window
 * height and will be updated on window resize.
 */
export function setElementMaxHeight() {
    const $element = $('.set-max-height');
    let scrollTop = 0;

    if (!$element) return;

    updateMaxHeight();

    $(window).on('load resize scroll', function () {
        scrollTop = $(window).scrollTop();
        updateMaxHeight();
    });

    /**
     * Sets the `max-height` value to the element
     * to be sure that it always fits on the page.
     */
    function updateMaxHeight() {
        $element.each(function() {
            const $this = $(this);
            const maxHeight = calculateMaxHeight($this);

            $(this).css({
                'overflow': 'auto',
                'max-height': maxHeight
            });
        });
    }

    /**
     * Calculates the possible element `max-height` based on the window
     * and navigation heights.
     *
     * @return {number} maxHeight the value of the maximum possible height
     */
    function calculateMaxHeight($element) {
        const windowHeight = $(window).height();
        const elementTopPosition = getTopOffset($element);
        const elementBottomMargin = 20;
        const maxHeight = windowHeight - elementTopPosition - elementBottomMargin;

        return maxHeight;
    }

    /**
     * Returns the provided element top position relative to the window.
     *
     * <p>If the element is sticky, returns the CSS `top` value, otherwise
     * calculates the top position. It is useful when the hero section
     * is present on the page.
     *
     * @param $element the element whose position needs to be calculated
     * @return {number} the top position of the element
     */
    function getTopOffset($element) {
        const stickyTop = parseInt($element.css('top'), 10) || 0;
        const isSticky = $element[0].getBoundingClientRect().top <= stickyTop;
        let topPosition;

        if (isSticky) {
            topPosition = stickyTop;
        } else {
            topPosition = $element.offset().top - scrollTop;
        }

        return topPosition;
    }
}
