import { StoryObj } from '@storybook/html';
import storyHtml from './Introduction.stories.html';

import './Introduction.stories.css';


export default {
    title: "Shko Online's AudioPlayer/Introduction",   

};

export const Introduction = {
    render: () => storyHtml,
decorators:[],
    parameters: {
        // controls: false
    }
} as StoryObj;
