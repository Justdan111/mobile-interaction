/// <reference types="nativewind/types" />

// Metro resolves `global.css` through nativewind's transformer, but TypeScript
// has no notion of a CSS module and rejects the side-effect import without this.
declare module '*.css';
