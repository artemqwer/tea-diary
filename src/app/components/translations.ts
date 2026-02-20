export type Locale = 'uk' | 'en';

export const translations = {
    uk: {
        // Nav
        nav: {
            home: 'Головна',
            stash: 'Сховище',
            history: 'Історія',
        },

        // Home
        home: {
            greeting_morning: 'Доброго ранку',
            greeting_afternoon: 'Добрий день',
            greeting_evening: 'Добрий вечір',
            greeting_night: 'Добраніч',
            sessions: 'сесій',
            steeps: 'проливів',
            time_spent: 'хв',
            stats_sessions: 'Сесій',
            stats_steeps: 'Проливів',
            stats_hours: 'Годин чаю',
            stats_teas: 'Видів чаю',
            activity_title: 'Активність',
            start_session: 'Почати сесію',
            quick_brew: 'Швидке заварювання',
            this_month: 'Цього місяця:',
            no_teas_prompt: 'Додайте перший чай до сховища, щоб розпочати сесію.',
            go_to_stash: 'Перейти до сховища →',
        },

        // Stash
        stash: {
            title: 'Сховище',
            add_tea: 'Додати чай',
            search_placeholder: 'Пошук чаю...',
            empty_title: 'Сховище порожнє',
            empty_subtitle: 'Додайте свій перший чай',
            remaining: 'Залишок',
            of: 'з',
            brew: 'Заварити',
            delete: 'Видалити',
            confirm_delete_title: 'Видалити чай?',
            confirm_delete_msg: (name: string) => `Ви впевнені, що хочете видалити "${name}"? Всю пов'язану статистику буде втрачено.`,
        },

        // Add Tea Modal
        addTea: {
            title: 'Додати новий чай',
            name_label: 'Назва чаю',
            name_placeholder: 'Наприклад: Лао Бань Чжан 2019',
            type_label: 'Тип',
            year_label: 'Рік',
            region_label: 'Регіон',
            region_placeholder: 'Напр. Menghai',
            weight_label: 'Вага (г)',
            color_label: 'Колір вкладки типу',
            color_preview: 'Попередній вигляд:',
            color_auto: 'Авто',
            submit: 'Зберегти чай',
            ai_analyze: 'Аналіз AI',
            ai_analyzing: 'Аналізую...',
            ai_error: 'Помилка аналізу',
            custom_type_placeholder: 'Впишіть свій тип чаю',
            tea_types: {
                puer: 'Пуер (Puer)',
                shu: 'Шу Пуер (Shu)',
                sheng: 'Шен Пуер (Sheng)',
                oolong: 'Улун (Oolong)',
                red: 'Червоний (Red)',
                green: 'Зелений (Green)',
                white: 'Білий (White)',
                yellow: 'Жовтий (Yellow)',
                black: 'Чорний (Black)',
                gaba: 'GABA (Габа)',
                dark: 'Хей Ча (Dark)',
                other: 'Інший...',
            },
        },

        // Session / Timer
        session: {
            title: 'Tea Session',
            finish: 'Фініш',
            back: 'Назад',
            mode_stopwatch: '⏱ Секундомір',
            mode_timer: '⏳ Таймер',
            water: 'Вода',
            leaf: 'Лист',
            vessel: 'Посуд',
            meditate: 'Медитуй',
            min_label: 'хв',
            sec_label: 'сек',
            timer_hint: 'Вкажи час заварювання і натисни ▶',
            time_up: 'Час вийшов! 🍵',
            extend: '+1 хв',
            steep_prefix: '#',
        },

        // Summary
        summary: {
            title: 'Як вам чай?',
            session_time: 'Час сесії:',
            save: 'Зберегти в історію',
        },

        // History
        history: {
            title: 'Журнал',
            empty: 'Немає записів',
            empty_subtitle: 'Проводьте сесії, щоб бачити статистику',
            steeps: 'проливів',
            time: 'хв',
        },

        // Profile
        profile: {
            title: 'Профіль',
            logout: 'Вийти',
            change_avatar: 'Змінити аватар',
            theme_settings: 'Налаштування теми',
            vibration: 'Вібрація',
            vibration_on: 'Увімк.',
            vibration_off: 'Вимк.',
            language: 'Мова',
            themes: {
                forest: 'Ліс',
                ocean: 'Океан',
                ember: 'Жар',
                lavender: 'Лаванда',
                midnight: 'Північ',
                rose: 'Троянда',
                sage: 'Шавлія',
            },
        },

        // Avatar modal
        avatar: {
            title: 'Змінити аватар',
            generate_tab: 'Згенерувати',
            upload_tab: 'Завантажити',
            style_label: 'Стиль',
            generate_btn: 'Згенерувати',
            save_btn: 'Зберегти',
            upload_hint: 'Натисніть, щоб завантажити зображення',
            upload_formats: 'JPG, PNG, WebP до 5MB',
        },

        // Confirmation modal
        confirm: {
            cancel: 'Скасувати',
            confirm: 'Підтвердити',
        },
    },

    en: {
        // Nav
        nav: {
            home: 'Home',
            stash: 'Stash',
            history: 'History',
        },

        // Home
        home: {
            greeting_morning: 'Good morning',
            greeting_afternoon: 'Good afternoon',
            greeting_evening: 'Good evening',
            greeting_night: 'Good night',
            sessions: 'sessions',
            steeps: 'steeps',
            time_spent: 'min',
            stats_sessions: 'Sessions',
            stats_steeps: 'Steeps',
            stats_hours: 'Tea hours',
            stats_teas: 'Tea types',
            activity_title: 'Activity',
            start_session: 'Start session',
            quick_brew: 'Quick brew',
            this_month: 'This month:',
            no_teas_prompt: 'Add your first tea to the stash to start a session.',
            go_to_stash: 'Go to stash →',
        },

        // Stash
        stash: {
            title: 'Stash',
            add_tea: 'Add tea',
            search_placeholder: 'Search tea...',
            empty_title: 'Stash is empty',
            empty_subtitle: 'Add your first tea',
            remaining: 'Remaining',
            of: 'of',
            brew: 'Brew',
            delete: 'Delete',
            confirm_delete_title: 'Delete tea?',
            confirm_delete_msg: (name: string) => `Are you sure you want to delete "${name}"? All related stats will be lost.`,
        },

        // Add Tea Modal
        addTea: {
            title: 'Add new tea',
            name_label: 'Tea name',
            name_placeholder: 'E.g.: Lao Ban Zhang 2019',
            type_label: 'Type',
            year_label: 'Year',
            region_label: 'Region',
            region_placeholder: 'E.g. Menghai',
            weight_label: 'Weight (g)',
            color_label: 'Type badge color',
            color_preview: 'Preview:',
            color_auto: 'Auto',
            submit: 'Save tea',
            ai_analyze: 'AI Analyze',
            ai_analyzing: 'Analyzing...',
            ai_error: 'Analysis error',
            custom_type_placeholder: 'Enter custom tea type',
            tea_types: {
                puer: 'Puer',
                shu: 'Shu Puer',
                sheng: 'Sheng Puer',
                oolong: 'Oolong',
                red: 'Red Tea',
                green: 'Green Tea',
                white: 'White Tea',
                yellow: 'Yellow Tea',
                black: 'Black Tea',
                gaba: 'GABA',
                dark: 'Hei Cha (Dark)',
                other: 'Other...',
            },
        },

        // Session / Timer
        session: {
            title: 'Tea Session',
            finish: 'Finish',
            back: 'Back',
            mode_stopwatch: '⏱ Stopwatch',
            mode_timer: '⏳ Timer',
            water: 'Water',
            leaf: 'Leaf',
            vessel: 'Vessel',
            meditate: 'Meditate',
            min_label: 'min',
            sec_label: 'sec',
            timer_hint: 'Set brew time and press ▶',
            time_up: "Time's up! 🍵",
            extend: '+1 min',
            steep_prefix: '#',
        },

        // Summary
        summary: {
            title: 'How was the tea?',
            session_time: 'Session time:',
            save: 'Save to history',
        },

        // History
        history: {
            title: 'Journal',
            empty: 'No records yet',
            empty_subtitle: 'Run sessions to see your stats',
            steeps: 'steeps',
            time: 'min',
        },

        // Profile
        profile: {
            title: 'Profile',
            logout: 'Sign out',
            change_avatar: 'Change avatar',
            theme_settings: 'Theme settings',
            vibration: 'Vibration',
            vibration_on: 'On',
            vibration_off: 'Off',
            language: 'Language',
            themes: {
                forest: 'Forest',
                ocean: 'Ocean',
                ember: 'Ember',
                lavender: 'Lavender',
                midnight: 'Midnight',
                rose: 'Rose',
                sage: 'Sage',
            },
        },

        // Avatar modal
        avatar: {
            title: 'Change avatar',
            generate_tab: 'Generate',
            upload_tab: 'Upload',
            style_label: 'Style',
            generate_btn: 'Generate',
            save_btn: 'Save',
            upload_hint: 'Click to upload an image',
            upload_formats: 'JPG, PNG, WebP up to 5MB',
        },

        // Confirmation modal
        confirm: {
            cancel: 'Cancel',
            confirm: 'Confirm',
        },
    },
} as const;

export type TranslationKey = typeof translations.uk;
