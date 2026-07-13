/// <reference types="vite/client" />
declare class YCPay {
    constructor(publicKey: string, options: {
        formContainer: string;
        locale?: string;
        isSandbox?: boolean;
        errorContainer?: string;
        customCSS?: string;
        token?: string;
    });

    renderCreditCardForm(theme?: string): void;
    pay(token: string): Promise<any>;
    renderAvailableGateways(list? : Array, theme?: string )
}

// swiper-css.d.ts
declare module 'swiper/css';
declare module 'swiper/css/bundle';
declare module 'swiper/css/navigation';
declare module 'swiper/css/free-mode';
declare module 'swiper/css/thumbs';


declare module 'bidi-js' {
  export function getVisualString(input: string): string;
}

declare module 'arabic-reshaper' {
  const arabicReshaper: {
    convertArabic(text: string): string;
    convertArabicBack(text: string): string;
  };
  export = arabicReshaper;
}