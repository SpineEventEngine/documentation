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
 * Makes the Hugo TOC items interactive.
 * 
 * <p>During scrolling, adds the `current` class to the anchor, the heading 
 * of which is now visible on the page.
 *
 * <p>Note, that the TOC element should be wrapped into the `div` with 
 * the `interactive-toc` class. For example:
 * ```
 * <div class="interactive-toc">
 *     {{ .TableOfContents }}
 * </div>
 * ```
 *
 * To render the TOC with the animated indicator line, use this layout:
 * ```
 * <div class="interactive-toc with-indicator-line">
 *     <div class="toc-indicator"></div>
 *     {{ .TableOfContents }}
 * </div>
 * ```
 */
export function interactiveToc() {
    const $interactiveToc = $('.interactive-toc');
    const $tocItems = $interactiveToc.find('#TableOfContents a');
    const $tocIndicator = $interactiveToc.find('.toc-indicator');
    const currentClass = 'current';
    let anchors = null;

    if ($interactiveToc.length) {
        getAnchors();
        markCurrentItem();

        $(window).on('scroll', function() {
            markCurrentItem();
        });
    }

    /**
     * Marks the current TOC item with the `currentClass`. 
     */
    function markCurrentItem() {
        const $currentItem = getCurrentItem();
        $tocItems.removeClass(currentClass);
        $currentItem.addClass(currentClass);
        updateIndicator($currentItem);
    }

    /**
     * Returns the TOC item, heading of which is now visible on the page.
     *
     * @returns {jQuery|HTMLElement} the current TOC item
     */
    function getCurrentItem() {
        const scrollPosition = window.pageYOffset;
        const windowIncrement = 0.14;
        let currentAnchor = null;
        anchors.each(function() {
            let headingPosition = getHeading(this).position().top;
            if (headingPosition < scrollPosition + window.innerHeight * windowIncrement) {
                currentAnchor = this;
                return;
            }
        })
        return getItem(currentAnchor);
    }

    /**
     * Returns the TOC item corresponding to the provided `anchor`.
     *
     * @param {String} anchor the anchor of the visible heading
     * @returns {*|jQuery|HTMLElement} the TOC item corresponding to the `anchor`
     */
    function getItem(anchor) {
        return $(`#TableOfContents a[href="${anchor}"]`);
    }

    /**
     * Returns the heading element corresponding to the provided `anchor`.
     *
     * @param {String} anchor the anchor of the heading
     * @returns {*|jQuery|HTMLElement} the heading element
     */
    function getHeading(anchor) {
        return $(':header[id=' + anchor.substring(1) + ']');
    }

    /**
     * Returns the list of available anchors on the page.
     *
     * @returns {Array} the list of anchors
     */
    function getAnchors() {
        if (!anchors) {
            anchors = $tocItems.map(function() {
                return $(this).attr("href");
            });
        }
        return anchors;
    }

    /**
     * Updates the position and height of the current TOC item indicator.
     *
     * @param {jQuery|HTMLElement} $currentItem the current TOC item
     */
    function updateIndicator($currentItem) {
        if (!$tocIndicator.length) return;

        if ($currentItem.length) {
            const itemTopOffset = $currentItem.position().top;
            const itemHeight = $currentItem.outerHeight();

            $tocIndicator.css({
                top: itemTopOffset,
                height: itemHeight,
            });
        }
    }
}
