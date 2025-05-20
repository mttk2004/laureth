declare module '@tabler/icons-react' {
    import { FC, SVGProps } from 'react';

    export interface TablerIconsProps extends SVGProps<SVGSVGElement> {
        size?: number | string;
        stroke?: number;
        color?: string;
    }

    export type TablerIcon = FC<TablerIconsProps>;

    export const IconConstruction: TablerIcon;
    export const IconTools: TablerIcon;
    export const IconClock: TablerIcon;
    // Thêm các icon khác nếu cần
}
