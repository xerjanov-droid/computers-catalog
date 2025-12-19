export { };

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initDataUnsafe?: {
                    user?: {
                        language_code?: string;
                        id?: number;
                        first_name?: string;
                        username?: string;
                    };
                };
                showAlert: (message: string) => void;
                ready: () => void;
                expand: () => void;
                MainButton: {
                    text: string;
                    color: string;
                    textColor: string;
                    isVisible: boolean;
                    isActive: boolean;
                    show: () => void;
                    hide: () => void;
                    onClick: (callback: () => void) => void;
                    offClick: (callback: () => void) => void;
                    showProgress: (leaveActive: boolean) => void;
                    hideProgress: () => void;
                };
                openTelegramLink: (url: string) => void;
                themeParams: {
                    bg_color?: string;
                    text_color?: string;
                    hint_color?: string;
                    link_color?: string;
                    button_color?: string;
                    button_text_color?: string;
                    secondary_bg_color?: string;
                };
            };
        };
    }
}
