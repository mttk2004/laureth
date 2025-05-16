declare module 'html2pdf.js' {
    export default function(): {
        set: (options: any) => any;
        from: (element: HTMLElement) => any;
        save: () => Promise<void>;
    };
}
