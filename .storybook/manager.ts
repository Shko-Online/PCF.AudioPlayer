import { AddonStore, addons } from '@storybook/addons';

type Addon_Config<T extends AddonStore['setConfig']> = T extends (value: infer K) => void ? K : never;
type ThemeVars = Addon_Config<AddonStore['setConfig']>['theme'];

addons.setConfig({
    theme: {
        brandTitle: "Shko Online's Audio Player",
        brandUrl: 'https://github.com/Shko-Online/PCF.AudioPlayer',
        brandImage: './Shko Online 92x32.svg',
    } as ThemeVars,
    showRoots: false,
});
