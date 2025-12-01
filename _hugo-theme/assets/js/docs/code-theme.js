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

import * as params from '@params';

/**
 * Changes the code theme styles and body class on the toggle click.
 *
 * <p>The selected theme will be saved in cookies and the user will be able
 * to navigate between pages without selecting the theme again.
 *
 * <p>The stylesheet is applied in `layouts/_partials/head/code-theme.html`.
 */
export function initCodeTheme() {
    const $body = $('body');
    const $themeCSS = $('#code-theme-css');
    const $themeToggle = $('#code-theme-toggle');
    const themeClass = {
        dark: 'dark-code-theme',
        light: 'light-code-theme'
    }
    const toggleClass = {
        dark: 'dark',
        light: 'light'
    }
    const defaultTheme = params.defaultCodeTheme || 'dark';

    let theme = Cookies.get('code-theme') || defaultTheme;

    setTheme(theme);

    $themeToggle.on('click', function () {
        const currentHref = $themeCSS.attr('href');
        const lightHref = $themeCSS.data('light');
        const isLight = currentHref === lightHref;
        const newTheme = isLight ? 'dark' : 'light';

        setTheme(newTheme);
        Cookies.set('code-theme', newTheme);
    });

    /**
     * Sets the provided theme as the body class and changes the CSS URL
     * to the corresponding one.
     *
     * @param {string} theme the code theme to be set
     */
    function setTheme(theme) {
        $themeCSS.attr('href', $themeCSS.data(theme));
        $body.removeClass(`${themeClass.dark} ${themeClass.light}`)
             .addClass(themeClass[theme]);
        $themeToggle.removeClass(`${toggleClass.dark} ${toggleClass.light}`)
            .addClass(toggleClass[theme]);
    }
}
