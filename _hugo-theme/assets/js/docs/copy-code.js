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

import {copyToClipboard} from "js/components/copy-to-clipboard.js";

/**
 * Displays the copy icon near each code block, which was added in markdown.
 *
 * <p>By clicking on the icon, the code examples will be copied to the clipboard.
 * <p>The corresponding styles are in `assets/scss/components/docs/_code-copy-icon.scss`.
 */
export function initCopyCodeIcon() {
    const $codeBlock = $('.markdown').find('.highlight');
    const iconClass = {
        icon: 'copy-code-to-clipboard-icon',
        iconFont: 'icon-copy far fa-clone',
        tooltip: 'copy-code-tooltip',
        tooltipShow: 'show',
    }
    const codeBlockClass = {
        wrapper: 'code-wrapper',
        header: 'code-block-header'
    }
    const copyCodeTranslation = {
        en: 'Copy code',
        zh: '复制代码',
    }
    const copiedTranslation = {
        en: 'Copied',
        zh: '已复制',
    }

    let tooltipTimeout;

    createCopyIcon();
    copyToClipboardOnClick();

    /**
     * Creates the copy icon in the DOM inside each `$codeBlock` on the page.
     *
     * <p>If this is a code block with a header, the icon will be placed
     * to the right of that header.
     */
    function createCopyIcon() {
        if ($codeBlock.length) {
            $codeBlock.each(function () {
                const codeBlock = $(this);
                const codeWrapper = codeBlock.closest(`.${codeBlockClass.wrapper}`);
                const icon = getIcon();

                if (codeWrapper.length) {
                    const codeHeader = codeWrapper.prevAll(`.${codeBlockClass.header}`);
                    if (!codeHeader.find(`.${iconClass.icon}`).length) {
                        codeHeader.append(icon);
                    }
                } else {
                    codeBlock.append(icon);
                }
            });
        }
    }

    /**
     * Copies the code to the clipboard on the copy icon click.
     *
     * <p>Checks whether the icon is in code tabs or a simple code block
     * and finds the corresponding code to copy.
     */
    function copyToClipboardOnClick() {
        $(`.${iconClass.icon}`).click(function () {
            const copyIcon = $(this);
            const codeBlock = copyIcon.closest('.code-block');
            const tooltip = copyIcon.next(`.${iconClass.tooltip}`);
            let codeWrapper;

            const codeTabs = copyIcon.closest(`.${codeBlockClass.header}.tabs`);
            const codeHeader = copyIcon.closest(`.${codeBlockClass.header}`);

            if (codeTabs.length) {
                codeWrapper = codeBlock.find(`.${codeBlockClass.wrapper}.active`);
            } else if (codeHeader.length) {
                codeWrapper = codeBlock.find(`.${codeBlockClass.wrapper}`);
            } else {
                codeWrapper = copyIcon.prev();
            }

            const codeToCopy = getCodeText(codeWrapper);

            hideTooltips();
            copyToClipboard(codeToCopy, false);
            showTooltip(tooltip);
        });
    }

    /**
     * Shows the tooltip and hides it after 1,5 seconds.
     *
     * @param {element} tooltip the tooltip element that will be shown
     */
    function showTooltip(tooltip) {
        tooltip.addClass(iconClass.tooltipShow);
        tooltipTimeout = setTimeout(function () {
                hideTooltips();
            }, 1500
        );
    }

    /**
     * Hides tooltips.
     */
    function hideTooltips() {
        const tooltips = $(`.${iconClass.tooltip}`);

        clearTimeout(tooltipTimeout);
        if (tooltips.length) {
            tooltips.removeClass(iconClass.tooltipShow);
        }
    }

    /**
     * Returns the HTML element of the "copy" icon with a tooltip.
     *
     * @returns {*|jQuery|HTMLElement} copy icon
     */
    function getIcon() {
        const title = copyCodeTranslation.en;
        const tooltipText = copiedTranslation.en;

        return $(`<i class="${iconClass.icon} ${iconClass.iconFont}" title="${title}"></i>
                     <div class="${iconClass.tooltip}"><span>${tooltipText}</span></div>`);
    }

    /**
     * Returns the code text from the provided `codeWrapper`.
     *
     * <p>If a code example contains a column with code line numbers,
     * they will not be added to the resulting text.
     *
     * @param {element} codeWrapper the wrapper element that contains the code
     * @returns {String} returns the text of the code
     */
    function getCodeText(codeWrapper) {
        if (codeWrapper.find('table').length) {
            return codeWrapper.find('table td:last code').text();
        }
        return codeWrapper.find('code').text();
    }
};
