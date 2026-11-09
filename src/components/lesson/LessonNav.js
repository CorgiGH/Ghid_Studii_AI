// What a cardlinks part needs from the player: the ids of the lesson's screens and a way to open one by id. Outside the player
// (the review tab) there is no provider, and a cardlinks list is drawn as plain text.
import { createContext, useContext } from 'react';

const LessonNavContext = createContext(null);
export default LessonNavContext;

export const useLessonNav = () => useContext(LessonNavContext);
